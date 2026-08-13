import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type ReactElement,
} from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import type { ApplicationVerifier } from "firebase/auth";

import { colors, fonts, spacing } from "@/src/constants/theme";
import { firebaseConfig } from "@/src/lib/firebaseConfig";

export type RecaptchaVerifierHandle = ApplicationVerifier & {
  _reset: () => void;
};

type RecaptchaMessage =
  | { type: "load" }
  | { type: "verify"; token: string }
  | { type: "error"; message?: string }
  | { type: "expire" };

function parseMessage(raw: string): RecaptchaMessage | null {
  try {
    const parsed = JSON.parse(raw) as RecaptchaMessage;
    if (!parsed || typeof parsed !== "object" || !("type" in parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function recaptchaHtml(): string {
  const configJson = JSON.stringify({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId,
  });

  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
    <style>
      html, body { margin: 0; padding: 12px; background: #fff; font-family: sans-serif; }
    </style>
  </head>
  <body>
    <div id="recaptcha-container"></div>
    <script>
      function send(payload) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      }
      try {
        firebase.initializeApp(${configJson});
        var verifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
          size: "normal",
          callback: function (token) { send({ type: "verify", token: token }); },
          "expired-callback": function () { send({ type: "expire" }); },
          "error-callback": function () { send({ type: "error" }); }
        });
        verifier.render().then(function () {
          send({ type: "load" });
        }).catch(function (err) {
          send({ type: "error", message: String(err) });
        });
      } catch (err) {
        send({ type: "error", message: String(err) });
      }
    </script>
  </body>
</html>`;
}

export const RecaptchaVerifierModal = forwardRef<RecaptchaVerifierHandle>(
  function RecaptchaVerifierModal(_props, ref): ReactElement {
    const [visible, setVisible] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const resolveRef = useRef<((token: string) => void) | null>(null);
    const rejectRef = useRef<((error: Error) => void) | null>(null);

    const cleanup = useCallback(() => {
      setVisible(false);
      setLoaded(false);
      resolveRef.current = null;
      rejectRef.current = null;
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        type: "recaptcha",
        verify: () =>
          new Promise<string>((resolve, reject) => {
            resolveRef.current = resolve;
            rejectRef.current = reject;
            setLoaded(false);
            setVisible(true);
          }),
        _reset: () => undefined,
      }),
      [],
    );

    const onMessage = (event: WebViewMessageEvent) => {
      const message = parseMessage(event.nativeEvent.data);
      if (!message) {
        return;
      }

      switch (message.type) {
        case "load":
          setLoaded(true);
          return;
        case "verify":
          resolveRef.current?.(message.token);
          cleanup();
          return;
        case "expire":
          rejectRef.current?.(new Error("reCAPTCHA expired. Try again."));
          cleanup();
          return;
        case "error":
          rejectRef.current?.(new Error(message.message ?? "Failed to load reCAPTCHA."));
          cleanup();
          return;
        default: {
          const _exhaustive: never = message;
          return _exhaustive;
        }
      }
    };

    const cancel = () => {
      rejectRef.current?.(new Error("Phone verification was cancelled."));
      cleanup();
    };

    return (
      <Modal visible={visible} animationType="slide" onRequestClose={cancel}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.header}>
            <Pressable onPress={cancel} accessibilityRole="button">
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.title}>Verify you are human</Text>
            <View style={styles.headerSpacer} />
          </View>
          {visible ? (
            <WebView
              source={{
                html: recaptchaHtml(),
                baseUrl: `https://${firebaseConfig.authDomain}`,
              }}
              onMessage={onMessage}
              javaScriptEnabled
              originWhitelist={["*"]}
              style={styles.webview}
            />
          ) : null}
          {!loaded ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loaderText}>Loading verification…</Text>
            </View>
          ) : null}
        </SafeAreaView>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cancel: {
    fontFamily: fonts.bodyMedium,
    color: colors.primary,
    fontSize: 16,
    width: 72,
  },
  title: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    fontSize: 16,
  },
  headerSpacer: {
    width: 72,
  },
  webview: {
    flex: 1,
  },
  loader: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 48,
    bottom: 0,
    alignItems: "center",
    paddingTop: spacing.xl,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  loaderText: {
    fontFamily: fonts.body,
    color: colors.textMuted,
  },
});

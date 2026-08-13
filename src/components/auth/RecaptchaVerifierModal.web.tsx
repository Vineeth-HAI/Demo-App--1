import { RecaptchaVerifier, type ApplicationVerifier } from "firebase/auth";
import { forwardRef, useImperativeHandle, useRef, type ReactElement } from "react";
import { StyleSheet, View } from "react-native";

import { auth } from "@/src/lib/firebase";

const WEB_CONTAINER_ID = "firebase-recaptcha-container";

export type RecaptchaVerifierHandle = ApplicationVerifier & {
  _reset: () => void;
};

export const RecaptchaVerifierModal = forwardRef<RecaptchaVerifierHandle>(
  function RecaptchaVerifierModal(_props, ref): ReactElement {
    const webVerifierRef = useRef<RecaptchaVerifier | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        type: "recaptcha",
        verify: async () => {
          if (typeof document !== "undefined") {
            let container = document.getElementById(WEB_CONTAINER_ID);
            if (!container) {
              container = document.createElement("div");
              container.id = WEB_CONTAINER_ID;
              document.body.appendChild(container);
            }
          }

          webVerifierRef.current?.clear();
          const verifier = new RecaptchaVerifier(auth, WEB_CONTAINER_ID, { size: "invisible" });
          webVerifierRef.current = verifier;
          return verifier.verify();
        },
        _reset: () => {
          webVerifierRef.current?.clear();
        },
      }),
      [],
    );

    return <View nativeID={WEB_CONTAINER_ID} style={styles.webAnchor} />;
  },
);

const styles = StyleSheet.create({
  webAnchor: {
    width: 1,
    height: 1,
    opacity: 0,
  },
});

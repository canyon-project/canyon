import { Button, Modal } from "antd";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function browserLabel(): string {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) {
    const m = ua.match(/Edg\/([\d.]+)/);
    return m ? `Edge ${m[1]}` : "Edge";
  }
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) {
    const m = ua.match(/Chrome\/([\d.]+)/);
    return m ? `Chrome ${m[1]}` : "Chrome";
  }
  if (/Firefox\//.test(ua)) {
    const m = ua.match(/Firefox\/([\d.]+)/);
    return m ? `Firefox ${m[1]}` : "Firefox";
  }
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) {
    const m = ua.match(/Version\/([\d.]+)/);
    return m ? `Safari ${m[1]}` : "Safari";
  }
  return ua.length > 160 ? `${ua.slice(0, 160)}…` : ua;
}

export type AboutCanyonModalProps = {
  open: boolean;
  onClose: () => void;
  userEmail?: string | null;
};

const Row: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    className="flex gap-4 py-2 border-b border-neutral-200 dark:border-neutral-700 text-sm"
    style={{ alignItems: "flex-start" }}
  >
    <div className="w-[160px] shrink-0 font-semibold text-neutral-800 dark:text-neutral-200">{label}</div>
    <div className="min-w-0 flex-1 break-all text-neutral-700 dark:text-neutral-300">{value}</div>
  </div>
);

type RuntimePayload = {
  operatingSystem: string;
  nodeVersion: string;
};

const AboutCanyonModal: FC<AboutCanyonModalProps> = ({ open, onClose, userEmail }) => {
  const { t, i18n } = useTranslation();
  const [clientConfigText, setClientConfigText] = useState("");
  const [runtime, setRuntime] = useState<RuntimePayload | null>(null);
  const [runtimeReady, setRuntimeReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    const payload = {
      theme: typeof localStorage !== "undefined" ? localStorage.getItem("theme") || "light" : "light",
      language: i18n.language || navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      viewport: typeof window !== "undefined" ? `${window.innerWidth}×${window.innerHeight}` : "",
    };
    setClientConfigText(JSON.stringify(payload, null, 2));
  }, [open, i18n.language]);

  useEffect(() => {
    if (!open) return;
    setRuntimeReady(false);
    setRuntime(null);
    let cancelled = false;
    fetch("/api/about/runtime", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<RuntimePayload>;
      })
      .then((data) => {
        if (!cancelled) {
          setRuntime(data);
          setRuntimeReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRuntime(null);
          setRuntimeReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <Modal
      title={t("about.title")}
      open={open}
      onCancel={onClose}
      footer={
        <Button type="primary" onClick={onClose}>
          {t("common.ok")}
        </Button>
      }
      width={640}
    >
      <div className="-mt-1">
        <Row label={t("about.version")} value={__APP_VERSION__} />
        <Row label={t("about.appMode")} value={t("about.appModeValue")} />
        <Row label={t("about.commit")} value={__APP_COMMIT__} />
        <Row label={t("about.currentUser")} value={userEmail?.trim() || "—"} />
        <Row label={t("about.browser")} value={browserLabel()} />
        <Row
          label={t("about.os")}
          value={runtimeReady ? (runtime?.operatingSystem ?? "—") : "…"}
        />
        <Row
          label={t("about.nodejs")}
          value={runtimeReady ? (runtime?.nodeVersion ?? "—") : "…"}
        />
      </div>
      <div className="mt-4">
        <div className="mb-2 font-semibold text-neutral-800 dark:text-neutral-200">{t("about.clientConfig")}</div>
        <pre
          className="m-0 max-h-[220px] overflow-auto rounded border border-neutral-200 bg-neutral-100 p-3 text-xs leading-relaxed text-neutral-800 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200"
          style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
        >
          {clientConfigText || "{}"}
        </pre>
      </div>
    </Modal>
  );
};

export default AboutCanyonModal;

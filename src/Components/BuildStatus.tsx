import { useEffect, useState } from "react";
import { buildInfo } from "../buildInfo";

export default function BuildStatus() {
  const [latestCommitHash, setLatestCommitHash] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function checkLatestCommit() {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${buildInfo.githubRepo}/commits/${buildInfo.branch}`,
          { signal: controller.signal }
        );

        if (!response.ok) return;

        const data = await response.json();
        setLatestCommitHash(data.sha);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error(err);
        }
      } finally {
        setIsChecking(false);
      }
    }

    checkLatestCommit();

    return () => controller.abort();
  }, []);

  const deployedCommit = buildInfo.commitHash;
  const isOutdated = latestCommitHash ? latestCommitHash !== deployedCommit : false;
  const commitDate = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(buildInfo.commitTimestamp));

  return (
    <div className="build-status">
      <span>{isChecking ? "Verificando versión" : isOutdated ? "Actualizando" : "Actualizado"}</span>
      <span>Commit {buildInfo.shortCommitHash}</span>
      <span>{commitDate}</span>
    </div>
  );
}

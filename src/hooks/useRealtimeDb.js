import { useEffect, useRef } from "react";
import { subscribeToDbSync } from "../services/db";

/**
 * Hook reativo para sincronização da base de dados em tempo real ao segundo.
 * 
 * Executa a função de carregamento:
 * 1. No primeiro render / montagem
 * 2. Instantaneamente (< 5ms) sempre que qualquer alteração ocorrer na base de dados (localmente ou noutra aba)
 * 3. Com um heartbeat de 1 segundo (1000ms) quando o documento está visível
 * 4. Imediatamente ao focar ou alternar de volta para a aba do navegador
 *
 * @param {Function} loadFn Função assíncrona ou síncrona que recarrega os dados frescos da base de dados
 * @param {Array} deps Dependências adicionais para recarregar o hook
 */
export function useRealtimeDb(loadFn, deps = []) {
  const loadFnRef = useRef(loadFn);

  useEffect(() => {
    loadFnRef.current = loadFn;
  }, [loadFn]);

  useEffect(() => {
    let isMounted = true;

    const executeLoad = () => {
      if (!isMounted) return;
      try {
        const result = loadFnRef.current();
        if (result && typeof result.catch === "function") {
          result.catch((err) => {
            console.warn("Notice in realtime DB sync load:", err);
          });
        }
      } catch (err) {
        console.warn("Notice executing realtime DB sync:", err);
      }
    };

    // 1. Carga inicial
    executeLoad();

    // 2. Subscrição reativa imediata a alterações na base de dados (Local + BroadcastChannel)
    const unsubscribe = subscribeToDbSync(() => {
      executeLoad();
    });

    // 3. Heartbeat ao segundo (1000ms) garantindo atualização ao segundo mesmo sem eventos manuais
    const secondInterval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        executeLoad();
      }
    }, 1000);

    // 4. Atualização imediata ao alternar de abas ou focar a janela
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        executeLoad();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", executeLoad);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(secondInterval);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", executeLoad);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default useRealtimeDb;

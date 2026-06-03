import axios, { AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { useApiStore } from '../stores/api.store';
import { useResponseStore } from '../stores/response.store';
import { useSettingsStore } from '../stores/settings.store';

// ─── Axios-инстанс с динамическим baseUrl и locale-заголовком ────────────────
// baseUrl и Accept-Language подставляются из стора настроек при каждом запросе

export const api = axios.create();

api.interceptors.request.use((config) => {
  const { baseUrl, locale } = useSettingsStore.getState();
  config.baseURL = baseUrl;
  config.headers['Accept-Language'] = locale;
  config.headers['Content-Type'] = 'application/json';
  return config;
});

// ─── Универсальная обёртка для HTTP-запросов ──────────────────────────────────
// Адаптация httpRequest из шаблона проекта:
//   + записывает ответ в responseStore (для правой панели)
//   + добавляет запись в историю
//   + показывает ошибочные ответы (4xx) в response-панели

export async function httpRequest<T>(
  requestFn:   () => Promise<AxiosResponse<T>>,
  callback?:   (data: T) => void,
  loadingMsg?: string,
  successMsg?: string
): Promise<T | null> {
  const { startRequest, setSuccess, setError } = useApiStore.getState();
  const { setResponse, addHistory } = useResponseStore.getState();

  const t0 = performance.now();
  startRequest();

  const promise = requestFn();

  // Toast с тремя состояниями: loading → success / error
  if (loadingMsg || successMsg) {
    toast.promise(promise, {
      loading: loadingMsg || '...',
      success: () => { setSuccess(); return successMsg || 'OK'; },
      error: (err: unknown) => {
        const e = err as { response?: { data?: { message?: string; detail?: string } } };
        const text = e.response?.data?.message || e.response?.data?.detail || 'Ошибка запроса';
        setError(text);
        return text;
      },
    });
  }

  try {
    const response = await promise;
    const elapsed = Math.round(performance.now() - t0);

    // Записываем успешный ответ в панель
    setResponse(response.status, response.data, elapsed);
    addHistory({
      method:  (response.config?.method?.toUpperCase() ?? 'GET') as 'GET' | 'POST',
      path:    response.config?.url ?? '',
      status:  response.status,
      elapsed,
      data:    response.data,
    });

    if (callback) callback(response.data);
    return response.data;

  } catch (error: unknown) {
    const elapsed = Math.round(performance.now() - t0);
    const e = error as {
      response?: { status?: number; data?: unknown; config?: { method?: string; url?: string } };
    };

    // Даже ошибочный ответ (4xx) показываем в панели — это важно для теста правил
    if (e.response) {
      setResponse(e.response.status ?? 0, e.response.data, elapsed);
      addHistory({
        method:  (e.response.config?.method?.toUpperCase() ?? 'POST') as 'GET' | 'POST',
        path:    e.response.config?.url ?? '',
        status:  e.response.status ?? 0,
        elapsed,
        data:    e.response.data,
      });
    }

    console.error('API Error:', error);
    return null;
  }
}

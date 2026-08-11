import crypto from "node:crypto";

const BASE_URL = "https://yce-api-01.perfectcorp.com";

let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

function getClientId(): string {
  const key = process.env.PERFECT_YOUCAM_API_KEY;
  if (!key) throw new Error("PERFECT_YOUCAM_API_KEY is not set");
  return key;
}

function getSecretKey(): string {
  const key = process.env.PERFECT_YOUCAM_SECRET_KEY;
  if (!key) throw new Error("PERFECT_YOUCAM_SECRET_KEY is not set");
  return key;
}

function createIdToken(): string {
  const clientId = getClientId();
  const timestamp = Date.now().toString();
  const payload = `client_id=${clientId}&timestamp=${timestamp}`;

  const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${getSecretKey()}\n-----END PUBLIC KEY-----`;

  const encrypted = crypto.publicEncrypt(
    {
      key: publicKeyPem,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(payload, "utf-8"),
  );

  return encrypted.toString("base64");
}

async function authenticate(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }

  const clientId = getClientId();
  const idToken = createIdToken();

  const res = await fetch(`${BASE_URL}/s2s/v1.0/client/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, id_token: idToken }),
  });

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Auth response not JSON: ${text}`);
  }

  if (!res.ok || json.error_code) {
    throw new Error(`Auth failed (${res.status}): ${JSON.stringify(json)}`);
  }

  const accessToken = json.result?.access_token || json.access_token;
  if (!accessToken) {
    throw new Error(`No access_token in response: ${JSON.stringify(json)}`);
  }

  cachedAccessToken = accessToken;
  tokenExpiresAt = Date.now() + 110 * 60 * 1000;
  return accessToken;
}

async function apiRequest(path: string, options: RequestInit = {}): Promise<any> {
  const token = await authenticate();
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();

  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return { status: res.status, ok: res.ok, data: json };
}

export async function testApiKey(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const token = await authenticate();

    const fileResult = await apiRequest("/s2s/v1.0/file/hair-style", {
      method: "POST",
    });

    const features: string[] = [];
    if (fileResult.ok) {
      features.push("hair-style");
    }

    return {
      success: true,
      message: "Perfect YouCam API key is valid and working",
      details: {
        authenticated: true,
        accessTokenObtained: !!token,
        fileUploadAvailable: fileResult.ok,
        fileUploadResponse: fileResult.data,
        availableFeatures: features.length > 0 ? features : ["auth verified"],
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function createFileUpload(featureType: string): Promise<{
  uploadUrl: string;
  fileId: string;
}> {
  const result = await apiRequest(`/s2s/v1.0/file/${featureType}`, {
    method: "POST",
  });

  if (!result.ok) {
    throw new Error(
      `File upload creation failed: ${JSON.stringify(result.data)}`,
    );
  }

  return {
    uploadUrl: result.data.result?.url || result.data.url,
    fileId: result.data.result?.file_id || result.data.file_id,
  };
}

export async function createSkinAnalysisFileUpload(): Promise<{
  uploadUrl: string;
  fileId: string;
}> {
  return createFileUpload("skin-analysis");
}

export async function startSkinAnalysisTask(fileId: string): Promise<{
  taskId: string;
  pollingInterval: number;
}> {
  const result = await apiRequest("/s2s/v1.0/task/skin-analysis", {
    method: "POST",
    body: JSON.stringify({ file_id: fileId }),
  });
  if (!result.ok) {
    throw new Error(`Skin analysis task failed: ${JSON.stringify(result.data)}`);
  }
  return {
    taskId: result.data.result?.task_id || result.data.task_id,
    pollingInterval: result.data.result?.polling_interval || result.data.polling_interval || 3,
  };
}

export async function getSkinAnalysisTask(taskId: string): Promise<any> {
  const result = await apiRequest(`/s2s/v1.0/task/skin-analysis/${taskId}`, { method: "GET" });
  if (!result.ok) {
    throw new Error(`Skin analysis status failed: ${JSON.stringify(result.data)}`);
  }
  return result.data.result || result.data;
}

export async function uploadImageToUrl(
  uploadUrl: string,
  imageBuffer: Buffer,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/jpg" },
    body: new Uint8Array(imageBuffer),
  });
  if (!res.ok) {
    throw new Error(`Image upload failed with status ${res.status}`);
  }
}

export async function startHairStyleTask(
  fileId: string,
  styleId: string,
): Promise<{
  taskId: string;
  pollingInterval: number;
}> {
  const result = await apiRequest("/s2s/v1.0/task/hair-style", {
    method: "POST",
    body: JSON.stringify({ file_id: fileId, style_id: styleId }),
  });

  if (!result.ok) {
    throw new Error(`Task creation failed: ${JSON.stringify(result.data)}`);
  }

  return {
    taskId: result.data.result?.task_id || result.data.task_id,
    pollingInterval:
      result.data.result?.polling_interval ||
      result.data.polling_interval ||
      3,
  };
}

export async function checkTaskStatus(
  featureType: string,
  taskId: string,
): Promise<{
  status: "running" | "success" | "error";
  resultUrl?: string;
  error?: string;
}> {
  const result = await apiRequest(
    `/s2s/v1.0/task/${featureType}/${taskId}`,
    { method: "GET" },
  );

  if (!result.ok) {
    throw new Error(
      `Task status check failed: ${JSON.stringify(result.data)}`,
    );
  }

  const taskResult = result.data.result || result.data;
  return {
    status: taskResult.status,
    resultUrl: taskResult.url || taskResult.result_url,
    error: taskResult.error_code || taskResult.error,
  };
}

export async function getHairStyleGroups(): Promise<any> {
  const result = await apiRequest("/s2s/v1.0/style-group/hair-style", {
    method: "GET",
  });
  return result.data;
}

export async function getHairStyles(groupId: string): Promise<any> {
  const result = await apiRequest(
    `/s2s/v1.0/style/hair-style?group_id=${groupId}`,
    { method: "GET" },
  );
  return result.data;
}

export async function getMakeupTransferFileUpload(): Promise<{
  uploadUrl: string;
  fileId: string;
}> {
  return createFileUpload("makeup-transfer");
}

export async function startMakeupTransferTask(
  sourceFileId: string,
  referenceFileId: string,
): Promise<{
  taskId: string;
  pollingInterval: number;
}> {
  const result = await apiRequest("/s2s/v1.0/task/makeup-transfer", {
    method: "POST",
    body: JSON.stringify({
      file_id: sourceFileId,
      ref_file_id: referenceFileId,
    }),
  });

  if (!result.ok) {
    throw new Error(
      `Makeup transfer task failed: ${JSON.stringify(result.data)}`,
    );
  }

  return {
    taskId: result.data.result?.task_id || result.data.task_id,
    pollingInterval:
      result.data.result?.polling_interval ||
      result.data.polling_interval ||
      3,
  };
}

export async function pollTaskUntilComplete(
  featureType: string,
  taskId: string,
  maxAttempts = 30,
): Promise<{ resultUrl: string } | { error: string }> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await checkTaskStatus(featureType, taskId);
    if (status.status === "success" && status.resultUrl) {
      return { resultUrl: status.resultUrl };
    }
    if (status.status === "error") {
      return { error: status.error || "Task failed" };
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return { error: "Task timed out" };
}

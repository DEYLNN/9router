import { NextResponse } from "next/server";
import { getProviderConnectionById } from "@/models";
import { updateProviderConnection } from "@/lib/localDb";
import { getExecutor } from "open-sse/executors/index.js";

function decodeJwtExp(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

function expiresAtFrom(result) {
  if (result?.expiresAt) return result.expiresAt;
  if (result?.expiresIn) return new Date(Date.now() + result.expiresIn * 1000).toISOString();
  return undefined;
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const connection = await getProviderConnectionById(id);

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    if (connection.authType !== "oauth") {
      return NextResponse.json({ error: "Refresh token is only available for OAuth connections" }, { status: 400 });
    }

    if (!connection.refreshToken) {
      return NextResponse.json({ error: "No refresh token stored for this account. Re-authorize the connection." }, { status: 400 });
    }

    const executor = getExecutor(connection.provider);
    if (!executor?.refreshCredentials) {
      return NextResponse.json({ error: `Provider ${connection.provider} does not support token refresh` }, { status: 400 });
    }

    const refreshResult = await executor.refreshCredentials({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
      expiresAt: connection.expiresAt || connection.tokenExpiresAt,
      providerSpecificData: connection.providerSpecificData,
    }, console, { strictProxy: false });

    if (!refreshResult?.accessToken) {
      return NextResponse.json({ error: "Failed to refresh access token. Re-authorize the connection if the refresh token is expired or revoked." }, { status: 401 });
    }

    const jwtExp = decodeJwtExp(refreshResult.accessToken);
    const jwtExpiresAt = jwtExp ? new Date(jwtExp * 1000).toISOString() : null;
    const expiresAt = jwtExpiresAt || expiresAtFrom(refreshResult);
    const updateData = {
      accessToken: refreshResult.accessToken,
      updatedAt: new Date().toISOString(),
    };

    if (refreshResult.refreshToken) updateData.refreshToken = refreshResult.refreshToken;
    if (refreshResult.expiresIn) updateData.expiresIn = refreshResult.expiresIn;
    if (expiresAt) updateData.expiresAt = expiresAt;
    if (refreshResult.providerSpecificData) {
      updateData.providerSpecificData = {
        ...(connection.providerSpecificData || {}),
        ...refreshResult.providerSpecificData,
      };
    }

    const updated = await updateProviderConnection(connection.id, updateData);

    return NextResponse.json({
      success: true,
      id: connection.id,
      provider: connection.provider,
      accessToken: updated?.accessToken,
      hasRefreshToken: !!updated?.refreshToken,
      refreshToken: updated?.refreshToken,
      expiresAt: updated?.expiresAt,
      accessTokenExpiresAt: expiresAt,
      accessTokenExpired: false,
      updatedAt: updated?.updatedAt,
    });
  } catch (error) {
    console.error("[Provider refresh-token]", error);
    return NextResponse.json({ error: error.message || "Failed to refresh access token" }, { status: 500 });
  }
}

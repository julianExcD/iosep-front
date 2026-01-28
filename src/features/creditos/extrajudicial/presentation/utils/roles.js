const ROLE_CLAIM_KEYS = [
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
  "roles",
  "role",
];

const normalizeRoleName = (role) => {
  if (!role || typeof role !== "string") {
    return null;
  }

  return role
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const decodeBase64 = (value) => {
  if (!value) {
    return null;
  }

  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );

    if (typeof atob === "function") {
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      if (typeof TextDecoder !== "undefined") {
        return new TextDecoder("utf-8").decode(bytes);
      }

      let decoded = "";
      for (const byte of bytes) {
        decoded += String.fromCharCode(byte);
      }
      return decoded;
    }

    if (typeof Buffer !== "undefined") {
      return Buffer.from(padded, "base64").toString("utf8");
    }
  } catch {
    return null;
  }

  return null;
};

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") {
    return null;
  }

  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    const decoded = decodeBase64(payload);
    return decoded ? JSON.parse(decoded) : null;
  } catch {
    return null;
  }
};

const extractRolesFromToken = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return [];
  }

  for (const claim of ROLE_CLAIM_KEYS) {
    const value = payload[claim];
    if (!value) {
      continue;
    }

    if (Array.isArray(value)) {
      return value.map((item) => (item != null ? String(item) : "")).filter(Boolean);
    }

    if (typeof value === "string") {
      return [value];
    }
  }

  return [];
};

const collectStringValues = (value) => {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectStringValues(item));
  }

  if (typeof value === "object") {
    return Object.values(value).flatMap((item) => collectStringValues(item));
  }

  return [];
};

const extractRolesFromObject = (roles) => {
  if (!Array.isArray(roles)) {
    return [];
  }

  return roles
    .flatMap((item) => {
      if (!item) {
        return [];
      }

      if (typeof item === "string") {
        return [item];
      }

      if (typeof item === "object") {
        const hasAccess =
          item.acceso === undefined ||
          item.acceso === null ||
          item.acceso === true ||
          item.acceso === 1 ||
          item.acceso === "1" ||
          item.acceso === "true";

        if (!hasAccess) {
          return [];
        }

        const primary =
          item.nombreEndpoint ??
          item.nombreendpoint ??
          item.nombre ??
          item.role ??
          item.descripcion ??
          null;

        if (primary) {
          return [primary, ...collectStringValues({ ...item, nombreEndpoint: undefined })];
        }

        return collectStringValues(item);
      }

      return [];
    })
    .filter(Boolean)
    .map(String);
};

const collectRolesFromAuthData = (rawAuth) => {
  if (!rawAuth) {
    return [];
  }

  let parsed = rawAuth;

  if (typeof rawAuth === "string") {
    try {
      parsed = JSON.parse(rawAuth);
    } catch {
      return [];
    }
  }

  if (Array.isArray(parsed)) {
    return extractRolesFromObject(parsed);
  }

  if (!parsed || typeof parsed !== "object") {
    return [];
  }

  const candidates = [
    parsed?.auth?.roles,
    parsed?.auth?.auth?.roles,
    parsed?.roles,
    parsed?.detalleUsuario,
  ];

  for (const candidate of candidates) {
    const extracted = extractRolesFromObject(candidate);
    if (extracted.length) {
      return extracted;
    }
  }

  return [];
};

export const getUserRoles = ({ authState = null, token: explicitToken = null } = {}) => {
  const normalized = new Set();

  const rawAuth =
    authState ??
    (typeof localStorage !== "undefined" ? localStorage.getItem("auth") : null);
  const token =
    explicitToken ??
    (typeof localStorage !== "undefined" ? localStorage.getItem("token") : null);

  const tokenRoles = extractRolesFromToken(token);
  const authRoles = collectRolesFromAuthData(rawAuth);

  const sources = tokenRoles.length ? tokenRoles : authRoles;

  sources.forEach((role) => {
    const normalizedRole = normalizeRoleName(role);
    if (normalizedRole) {
      normalized.add(normalizedRole);
    }
  });

  return Array.from(normalized);
};

export const userHasRole = (requiredRoles, userRoles = null) => {
  if (!requiredRoles?.length) {
    return true;
  }

  const normalizedRequired = requiredRoles
    .map((role) => (role != null ? String(role) : null))
    .map(normalizeRoleName)
    .filter(Boolean);

  if (!normalizedRequired.length) {
    return true;
  }

  const normalizedUserRoles = userRoles
    ? userRoles
    : getUserRoles();

  if (!normalizedUserRoles.length) {
    return false;
  }

  const userRolesSet = new Set(
    normalizedUserRoles.map((role) => normalizeRoleName(String(role))).filter(Boolean),
  );

  return normalizedRequired.some((role) => userRolesSet.has(role));
};

export const ADMIN_ROLE = "Administrador";
export const TURISMO_ROLES = [
  "Gestion Turismo",
  "Gestión Turismo",
  "Gestion de Turismo",
  "Gestión de Turismo",
  "Gestion Deudas",
  "Gestión Deudas",
  "Gestion de Deudas",
  "Gestión de Deudas",
  "Turismo",
  "Gestion Turismo UPCN",
  "Gestión Turismo UPCN",
];

const CODE_RE = /^(?=.*\d)[A-Za-z0-9]{4,8}$/;

function normalizeCode(value) {
	if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
		value = String(Math.trunc(value));
	}
	if (typeof value !== 'string') {
		return '';
	}
	const code = value.trim();
	if (!CODE_RE.test(code)) {
		return '';
	}
	return code;
}

function tryParseJson(text) {
	if (typeof text !== 'string') {
		return null;
	}
	const trimmed = text.trim();
	try {
		return JSON.parse(trimmed);
	} catch {
		// continue
	}
	const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
	if (fence) {
		try {
			return JSON.parse(fence[1].trim());
		} catch {
			// continue
		}
	}
	const obj = trimmed.match(/\{[\s\S]*\}/);
	if (obj) {
		try {
			return JSON.parse(obj[0]);
		} catch {
			// continue
		}
	}
	return null;
}

function codeFromParsed(json) {
	if (json == null) {
		return '';
	}
	if (typeof json === 'number' || typeof json === 'string') {
		return normalizeCode(json);
	}
	if (typeof json === 'object' && 'code' in json) {
		return normalizeCode(json.code);
	}
	return '';
}

export function parseAiResult(result) {
	if (result == null) {
		return '';
	}
	if (typeof result === 'number') {
		return normalizeCode(result);
	}
	if (typeof result === 'string') {
		const json = tryParseJson(result);
		if (json != null) {
			const fromJson = codeFromParsed(json);
			if (fromJson) {
				return fromJson;
			}
		}
		return normalizeCode(result);
	}
	if (typeof result === 'object') {
		const fromSelf = codeFromParsed(result);
		if (fromSelf) {
			return fromSelf;
		}
		const inner = result.response ?? result.output ?? result.result;
		if (inner !== undefined && inner !== result) {
			return parseAiResult(inner);
		}
	}
	return '';
}

const PHRASE_RE = /(?:verification code|one[-\s]?time (?:code|password|passcode)|security code|otp|验证码|校验码|確認コード)\s*(?:is|[:：]|为|為)?\s*([A-Za-z0-9]{4,8})\b/i;

export function extractCodeFromText(text) {
	if (!text) {
		return '';
	}
	const globalRe = new RegExp(PHRASE_RE.source, 'gi');
	let match;
	while ((match = globalRe.exec(String(text)))) {
		const code = normalizeCode(match[1]);
		if (code) {
			return code;
		}
	}
	return '';
}

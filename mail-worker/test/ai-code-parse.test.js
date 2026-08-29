import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseAiResult, extractCodeFromText } from '../src/utils/ai-code-parse.js';

describe('parseAiResult', () => {
	it('parses a JSON string with a string code', () => {
		assert.equal(parseAiResult('{"code":"739284"}'), '739284');
	});

	it('accepts a numeric code', () => {
		assert.equal(parseAiResult({ code: 739284 }), '739284');
	});

	it('reads Workers AI {response: jsonString}', () => {
		assert.equal(parseAiResult({ response: '{"code":"739284"}' }), '739284');
	});

	it('reads Workers AI {response: object}', () => {
		assert.equal(parseAiResult({ response: { code: '739284' } }), '739284');
	});

	it('extracts JSON wrapped in prose', () => {
		assert.equal(parseAiResult('Here you go:\n```json\n{"code":"739284"}\n```'), '739284');
	});

	it('accepts a bare 4-8 character code from the model', () => {
		assert.equal(parseAiResult('739284'), '739284');
	});

	it('rejects codes longer than 8 characters', () => {
		assert.equal(parseAiResult({ code: '123456789' }), '');
	});

	it('rejects codes that contain spaces', () => {
		assert.equal(parseAiResult({ code: '73 9284' }), '');
	});
});

describe('extractCodeFromText', () => {
	it('picks the code after "verification code is"', () => {
		assert.equal(
			extractCodeFromText('Your verification code is 739284.\nThis code expires in 10 minutes.'),
			'739284'
		);
	});

	it('picks a Chinese 验证码', () => {
		assert.equal(extractCodeFromText('您的验证码：A8K2M1，10分钟内有效'), 'A8K2M1');
	});

	it('returns empty when there is no verification phrasing', () => {
		assert.equal(extractCodeFromText('Invoice 20260829 amount 123456'), '');
	});
});

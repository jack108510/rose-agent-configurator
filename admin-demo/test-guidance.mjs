import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {resolve}=require('./atlas-guide.js');
const catalog=JSON.parse(fs.readFileSync(new URL('./rose-tools.json',import.meta.url),'utf8'));
for(const [prompt,id] of [
 ['How do I find my API key?','atlas-api-key'],['Where are my API keys?','atlas-keys'],
 ['Help me reset my password','atlas-password'],['How do I connect Stripe?','atlas-stripe'],
 ['How do I set up Stripe?','atlas-stripe'],['I want to create an API key','atlas-create-key'],
 ['How do I add a webhook endpoint?','atlas-webhook'],['I forgot my password','atlas-password'],
 ['I need to hook up Stripe','atlas-stripe'],['Help me invite a teammate','atlas-team'],
 ['Can you show me my API key?','atlas-keys'],['Please show me how to create a workflow','atlas-workflow'],
 ['wheres the api reference','atlas-api-reference'],['where’s the api reference?','atlas-api-reference'],
 ['Where is API reference?','atlas-api-reference'],['API docs','atlas-api-reference'],
 ['Show me the API documentation','atlas-api-reference'],['show integrations','atlas-integrations'],
 ['show my team','atlas-members'],['show my workflows','atlas-workflows'],
])test(prompt,()=>{const result=resolve(prompt,catalog,{});assert.equal(result?.type,'guide');assert.equal(result.tool.id,id);});
test('Catalog destinations use actual routes and unique identities',()=>{assert.equal(catalog.tools.length,new Set(catalog.tools.map(t=>t.id)).size);for(const t of catalog.tools){assert.ok(t.target);assert.ok(t.examples.length);assert.match(t.url,/^\.\/#(?:overview|activity|team|developers(?:\/(?:api-keys|webhooks|reference))?|integrations|settings\/(?:profile|security|preferences))$/);}});

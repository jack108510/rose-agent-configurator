import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

// Exercise the real runtime's request parser and task matcher without opening
// a browser, creating a session, or replacing the assistant's responses.
const runtime=fs.readFileSync(new URL('./rose-widget.js',import.meta.url),'utf8');
const catalog=JSON.parse(fs.readFileSync(new URL('./rose-tools.json',import.meta.url),'utf8'));
const base='https://jack108510.github.io/rose-agent-configurator/admin-demo/';
function section(start,end){return runtime.slice(runtime.indexOf(start),runtime.indexOf(end,runtime.indexOf(start)));}
function matcher(){
 const calls=[];
 const context=vm.createContext({URL,console,location:new URL(base),cfg:{desktopSidePanel:false},widgetOptions:{navigation:true},toolsConfigLocation:new URL('rose-tools.json',base),toolsReady:Promise.resolve(),publishedTools:catalog.tools.map(t=>({...t,url:new URL(t.url,base).href,score:200})),suggestedTools:[],renderToolSuggestions(){},visitorTaskLinks(){return[];},launchSuggestedTool(item){calls.push(item);},toolRank(item){return item.score;},host:null});
 vm.runInContext('const controlWords=value=>String(value||"").toLowerCase().replace(/[^\\p{L}\\p{N}]+/gu," ").trim();'+section('  function toolUrl(value)','  function toolScore(')+section('  function visitorTaskGoal(message)','  function visitorTaskLinks(')+section('  async function handleVisitorTaskRequest(message','  async function executeRequestedAction('),context);
 return {context,calls};
}
for(const [prompt,id] of [
 ['How do I find my API key?','atlas-api-key'],
 ['Where are my API keys?','atlas-api-keys'],
 ['Help me reset my password','atlas-password'],
 ['How do I connect Stripe?','atlas-stripe'],
 ['How do I set up Stripe?','atlas-stripe-setup'],
 ['I want to create an API key','atlas-create-key'],
 ['How do I add a webhook endpoint?','atlas-webhook'],
])test(prompt,async()=>{
 const {context,calls}=matcher();
 context.prompt=prompt;
 assert.equal(await vm.runInContext('handleVisitorTaskRequest(prompt)',context),true);
 assert.equal(calls.length,1);assert.equal(calls[0].id,id);
 assert.ok(calls[0].target.startsWith('#'));
});
test('floating widget uses its published catalog without enabling side-panel UI',()=>{
 const {context}=matcher();
 assert.equal(vm.runInContext('visitorTaskGoal("How do I find my API key?")',context),'find my API key');
 assert.match(runtime,/!cfg\.desktopSidePanel && !toolsConfigLocation/);
 assert.equal(catalog.tools.length,new Set(catalog.tools.map(t=>new URL(t.url,base).href)).size);
});

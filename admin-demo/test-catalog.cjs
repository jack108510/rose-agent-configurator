const test=require('node:test'),assert=require('node:assert/strict');const catalog=require('./rose-tools.json');const{resolve}=require('./atlas-guide.js');
for(const task of catalog.tools)for(const phrase of task.examples)test(phrase,()=>{const result=resolve(phrase,catalog,{stripe:['atlas-stripe-disconnect','atlas-stripe-manage'].includes(task.id),keyRevealed:task.id==='atlas-hide-key'});assert.equal(result?.type,'guide');assert.equal(result.tool.id,task.id);});
for(const [phrase,id]of [['wheres the api reference','atlas-api-reference'],['show integrations','atlas-integrations'],['connect Stripe','atlas-stripe'],['show my team','atlas-members'],['invite a teammate','atlas-team'],['show my workflows','atlas-workflows'],['create a workflow','atlas-workflow'],['where are my preferences','atlas-preferences'],['change my timezone','atlas-timezone']])test('Intent separation: '+phrase,()=>assert.equal(resolve(phrase,catalog,{stripe:false})?.tool?.id,id));
for(const phrase of ['delete my account','delete an API key','change API key permissions','rotate my key','upgrade my plan','connect Salesforce','disconnect Slack'])test('Unsupported: '+phrase,()=>assert.equal(resolve(phrase,catalog,{})?.type,'unsupported'));
test('Questions remain live factual questions',()=>{for(const q of ['What plan am I on?','How many workflows do I have?','What is an API key?','Why did that workflow fail?'])assert.equal(resolve(q,catalog,{}),null);});
test('Connected and disconnected Stripe states are honest',()=>{assert.equal(resolve('connect Stripe',catalog,{stripe:true}).type,'status');assert.equal(resolve('disconnect Stripe',catalog,{stripe:false}).type,'status');});
test('Created workflow details are discoverable without editing the catalog',()=>{const result=resolve('show Trial customer follow up',catalog,{workflows:[{name:'Trial customer follow up'}]});assert.equal(result.tool.target,'[data-workflow-index="0"]');});
test('Ambiguous destinations require a choice',()=>assert.equal(resolve('show settings and developers',catalog,{}).type,'clarify'));

test('Two named integration requests require a choice',()=>assert.equal(resolve('connect Stripe and GitHub',catalog,{}).type,'clarify'));
test('A new key can be revealed and hidden by name',()=>{for(const [q,revealed]of [['reveal my Secondary API key',false],['hide my Secondary API key',true]])assert.equal(resolve(q,catalog,{keys:[{name:'Secondary',revealed}]}).type,'guide');});

test('Generic supported actions offer choices instead of claiming unavailable',()=>assert.equal(resolve('add an integration',catalog,{}).type,'clarify'));
test('Unknown navigation does not invent a page',()=>assert.equal(resolve('open billing',catalog,{}).type,'unsupported'));

test('Common compound spellings resolve through the same catalog',()=>{assert.equal(resolve('where is my apikey',catalog,{}).tool.id,'atlas-keys');assert.equal(resolve('add a web hook',catalog,{}).tool.id,'atlas-webhook');assert.equal(resolve('connect git hub',catalog,{}).tool.id,'atlas-github');});

test('Editing profile cannot silently route around a read-only email field',()=>assert.equal(resolve('edit my profile email address',catalog,{}).type,'unsupported'));

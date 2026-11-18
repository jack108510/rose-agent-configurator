// Entirely synthetic, browser-local review data. No production API is contacted.
(()=>{
const key='roseManagedClientsReviewStateV2';
const empty=()=>({workspace:{id:'ptn_synthetic_review_agency_123456',ownerLeadId:'synthetic-owner',brand:{name:'Your agency',accent:'#315a65',theme:'warm',workgroundTitle:'Your agency Workground',logoData:''},deliveryOrigin:'https://widget.example.test',deliveryReady:true,clients:[],trial:{status:'active',endsAt:new Date(Date.now()+30*86400000).toISOString()},billing:{status:'trial'}},clients:[],drafts:{}});
let state;try{state=JSON.parse(sessionStorage.getItem(key))||empty()}catch{state=empty()}
const persist=()=>sessionStorage.setItem(key,JSON.stringify(state));
const escape=value=>String(value||'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const snippet=client=>`<script src="https://widget.example.test/rose-widget.js?partner=${escape(state.workspace.id)}&amp;client=${escape(client.clientId)}" data-business-name="${escape(client.businessName)}" data-website="${escape(client.website)}" async></script>`;
if(!sessionStorage.getItem(key)){
const client={clientId:'trial_1234567890abcdef12345678',businessName:'Coastal Bakehouse · sample client',website:'https://coastal.example.test/',notificationEmail:'leads@example.test',management:'agency',deliveryApproved:true,editingApproved:true,published:false,installed:false,mapping:{status:'waiting'},grantedAt:new Date().toISOString()};state.clients.push(client);state.workspace.clients.push({clientLeadId:client.clientId,deliveryApproved:true,editingApproved:true,management:'agency'});persist();
}
localStorage.setItem('roseManagedReviewToken','synthetic-review-token');
window.fetch=async(input,options={})=>{
const url=new URL(typeof input==='string'?input:input.url,location.href),route=url.pathname.slice(url.pathname.indexOf('/api/'));let body={};try{body=JSON.parse(options.body||'{}')}catch{}
const reply=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
const workspace=state.workspace,clients=state.clients;
if(route==='/api/rose-partner-workspace'){if(body.brand){workspace.brand={...workspace.brand,...body.brand};persist()}return reply(200,{workspace,assignedDeliveryOrigin:workspace.deliveryOrigin,assignedWorkgroundOrigin:'https://workground.example.test'});}
if(route==='/api/rose-partner-clients'){
if(body.action==='create'){
let website;try{const parsed=new URL(/^https?:\/\//.test(body.website)?body.website:`https://${body.website}`);if(!['https:','http:'].includes(parsed.protocol)||!parsed.hostname.includes('.'))throw Error();website=parsed.href}catch{return reply(400,{error:'Enter a valid website'})}
if(!body.businessName||!body.notificationEmail)return reply(400,{error:'Enter all the client details'});
const existing=clients.find(item=>item.website===website);if(existing){if(existing.businessName!==body.businessName||existing.notificationEmail!==body.notificationEmail)return reply(409,{error:'A client already exists for this website.'});return reply(200,{ok:true,clientId:existing.clientId,snippet:snippet(existing),replayed:true})}
const id='trial_'+Array.from(crypto.getRandomValues(new Uint8Array(12)),n=>n.toString(16).padStart(2,'0')).join('');
const client={clientId:id,businessName:body.businessName,website,notificationEmail:body.notificationEmail,management:'agency',deliveryApproved:true,editingApproved:true,published:false,installed:false,mapping:{status:'waiting'},grantedAt:new Date().toISOString()};clients.push(client);workspace.clients.push({clientLeadId:id,deliveryApproved:true,editingApproved:true,management:'agency'});persist();return reply(201,{ok:true,clientId:id,snippet:snippet(client)});
}
if(['pause','resume','update'].includes(body.action)){const client=clients.find(item=>item.clientId===body.clientId);if(!client)return reply(404,{error:'Client not found'});if(body.action==='resume'&&!client.published)return reply(409,{error:'Publish the setup first'});if(body.action==='update')client.notificationEmail=body.notificationEmail;else client.widgetActive=body.action==='resume';persist();return reply(200,{ok:true,widgetActive:client.widgetActive})}
if(body.action==='remove'){state.clients=clients.filter(item=>item.clientId!==body.clientId);workspace.clients=workspace.clients.filter(item=>item.clientLeadId!==body.clientId);persist();return reply(200,{ok:true})}return reply(200,{workspace,clients});
}
if(route==='/api/rose-partner-install'){const client=clients.find(item=>item.clientId===url.searchParams.get('clientId'));return client?reply(200,{snippet:snippet(client)}):reply(404,{error:'Client not found'});}
if(route==='/api/rose-partner-install-check'){const client=clients.find(item=>item.clientId===body.clientId);if(!client)return reply(404,{error:'Client not found'});client.installed=true;client.installCheckedAt=new Date().toISOString();client.mapping={status:'ready',pagesScanned:3};persist();return reply(200,{ok:true,connected:true,message:'Demonstration only: showing the connected state. No website was contacted.'});}
if(route==='/api/rose-partner-client-editor'){
const id=body.clientId||url.searchParams.get('clientId'),client=clients.find(item=>item.clientId===id);if(!client)return reply(404,{error:'Client not found'});let draft=state.drafts[id]||{version:0,settings:{businessName:client.businessName,website:client.website},appearance:{brandPrimary:'#315a65'},notes:[]};
if(['pause','resume'].includes(body.action)){if(body.action==='resume'&&!client.published)return reply(409,{error:'Publish the setup first'});client.widgetActive=body.action==='resume';persist();return reply(200,{ok:true,widgetActive:client.widgetActive})}
if(url.searchParams.get('format')==='export')return reply(200,{schemaVersion:1,clientId:id,businessName:client.businessName,website:client.website,notificationEmail:client.notificationEmail,accountDraft:draft,knowledge:draft.notes});
if(['save','publish'].includes(body.action)){if(Number(body.version)!==draft.version)return reply(409,{error:'Client changed. Reload and try again.'});client.notificationEmail=body.notificationEmail||client.notificationEmail;draft={...draft,version:draft.version+1,settings:{businessName:body.businessName,website:body.website,assistantIntro:body.assistantIntro},appearance:{greetingMessage:body.greetingMessage,brandPrimary:body.brandPrimary}};state.drafts[id]=draft;client.businessName=body.businessName;if(body.action==='publish'){client.published=true;if(client.widgetActive!==false)client.widgetActive=true;client.publishedAt=new Date().toISOString()}persist();return reply(200,{version:draft.version,published:client.published});}
if(body.action==='add_note'){draft.notes.push({id:crypto.randomUUID(),text:body.text});state.drafts[id]=draft;persist();return reply(200,{ok:true})}
if(body.action==='remove_note'){draft.notes=draft.notes.filter(item=>item.id!==body.noteId);state.drafts[id]=draft;persist();return reply(200,{ok:true})}
return reply(200,{client,draft,notes:draft.notes,published:client.published});
}
if(route==='/api/rose-partner-invitations')return reply(200,{invitations:[]});
if(route==='/api/rose-partner-domains')return reply(200,{domain:null,fallbackUrl:'https://workground.example.test'});
if(route==='/api/rose-partner-sender')return reply(200,{available:false,deliveryAvailable:false,sender:null});
if(route==='/api/rose-partner-billing')return reply(200,{configured:false,status:'trial',quote:{count:clients.filter(item=>item.published).length,totalCents:0,lines:[],rates:[]},invoices:[]});
return reply(400,{error:'This action is unavailable in the synthetic review preview. No live request was sent.'});
};
})();

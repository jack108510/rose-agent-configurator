/* A transport adapter for the unchanged Workground. No real account tokens or deliveries. */
(() => {
  'use strict';
  const nativeFetch = window.fetch.bind(window);
  const backing = window.sessionStorage;
  const prefix = 'rose-partner-review-personal-v1:';
  const clone = value => JSON.parse(JSON.stringify(value));
  const now = () => new Date().toISOString();
  const store = {
    getItem: k => backing.getItem(prefix+k),
    setItem: (k,v) => backing.setItem(prefix+k,String(v)),
    removeItem: k => backing.removeItem(prefix+k),
    clear: () => { for(const key of Object.keys(backing))if(key.startsWith(prefix))backing.removeItem(key); },
    key: i => Object.keys(backing).filter(k=>k.startsWith(prefix))[i]?.slice(prefix.length),
    get length(){return Object.keys(backing).filter(k=>k.startsWith(prefix)).length;}
  };
  Object.defineProperty(window,'localStorage',{configurable:true,get:()=>store});
  const facts = [
    'Northline Electrical is a fictional electrical contractor serving Edmonton and St. Albert.',
    'Services include electrical repairs, panel upgrades, lighting installations and EV charger installations.',
    'Office hours are Monday to Friday, 8 a.m. to 5 p.m. Prices require a quote; emergency service and availability are not guaranteed.',
    'This is a sample workspace. Inquiries, bookings, messages and external app actions are simulated.'
  ];
  const context = facts.map((text,i)=>({id:'sample-fact-'+i,text,source:'Sample business',createdAt:now(),reviewedAt:now()}));
  const seed = {
    appearance:{assistantName:'Rose',greetingMessage:'Northline Electrical’s AI front desk',widgetCopy:{title:'Rose',subtitle:'Northline Electrical’s AI front desk',greeting:'Hi! I’m Rose. I can answer electrical service questions and help prepare a quote request. How can I help?'},brandPrimary:'#e86643',brandAccent:'#f4c9b8',backgroundColor:'#fffaf3',textColor:'#211813',bubbleColor:'#fff5eb',buttonColor:'#e86643'},
    settings:{businessName:'Northline Electrical',website:'https://northline.example',ownerName:'Alex Demo',ownerEmail:'owner@example.invalid',phone:'+15555550123'},
    context,connections:[],workflows:[],builderHistory:[]
  };
  let state;
  try{state=JSON.parse(store.getItem('sampleState')||'null')}catch{}
  if(!state)state={draft:clone(seed),published:{...clone(seed),status:'published',publishedAt:now()},revision:0,connections:[],workflows:[],runs:[],notes:clone(context),chat:[]};
  const save = () => store.setItem('sampleState',JSON.stringify(state));
  const token='public-sample-not-an-account-token';
  store.setItem('wildroseDashboardToken',token);
  store.setItem('roseClientSettingsAccountIdentity','public-demo-northline');
  store.setItem('roseClientSettings',JSON.stringify(state.draft.settings));
  const response = (data,status=200) => Promise.resolve(new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}}));
  const install = () => ({snippet:'<script src="https://widget.example.test/rose-widget.js?client=synthetic-owner" data-website="https://northline.example" async></script>',connected:true,status:'connected',verifiedWebsite:'https://northline.example',stages:[{key:'install',done:true},{key:'live',done:!!state.published}],lastPublicInstallCheck:{connected:true,verificationVersion:2,verifiedWebsite:'https://northline.example'},sample:true});
  const profile = () => ({ok:true,account:{email:'owner@example.invalid',name:'Alex Demo'},customer:{checkoutLeadId:'public-demo-northline',id:'public-demo-northline',businessName:state.draft.settings.businessName,website:'https://northline.example',plan:'demo',planKey:'demo',status:'active'},business:{businessName:state.draft.settings.businessName,contactName:state.draft.settings.ownerName,phone:state.draft.settings.phone},draft:state.draft,published:state.published,draftRevision:state.revision,install:install(),bootstrap:{status:'ready',pagesScanned:3},security:{sessions:[]},sample:true});
  const api = async (path,body,method) => {
    if(path==='/api/rose-account-dashboard')return response(profile());
    if(path==='/api/rose-connections')return response({ok:true,connections:state.connections});
    if(path==='/api/rose-account-draft'){
      const draft=body.draft||body.config||body;
      state.draft={...clone(draft),updatedAt:now()};state.revision++;save();
      if(body.action==='publish'){state.published={...clone(state.draft),status:'published',publishedAt:now()};save();}
      return response({ok:true,draft:state.draft,published:state.published,revision:state.revision,draftRevision:state.revision,updatedAt:state.draft.updatedAt});
    }
    if(path==='/api/rose-account-publish'){
      state.published={...clone(state.draft),status:'published',publishedAt:now()};save();
      return response({ok:true,published:state.published,draft:state.draft,install:install(),message:'Published to this sample workspace only.'});
    }
    if(path==='/api/rose-account-knowledge'){
      if(method!=='GET'){
        if(body.action==='delete')state.notes=state.notes.filter(n=>n.id!==body.noteId);
        else {const note={...(body.note||body),id:body.note?.id||body.id||crypto.randomUUID(),createdAt:now(),reviewedAt:now()};state.notes.unshift(note);save();return response({ok:true,note,notes:state.notes});}
        save();
      }return response({ok:true,notes:state.notes});
    }
    if(path==='/api/rose-account-business'){
      Object.assign(state.draft.settings,body);save();return response({ok:true,business:state.draft.settings,customer:profile().customer});
    }
    if(path==='/api/rose-account-usage')return response({ok:true,plan:{name:'Sample workspace'},usage:{voiceMinutes:0,chatStarts:state.chat.length},sample:true});
    if(path==='/api/rose-install-status')return response({ok:true,install:install(),...install()});
    if(path==='/api/rose-review-notifications')return response({ok:true,notifications:[],questions:[],items:[]});
    if(path==='/api/rose-public-config')return response({ok:true,found:true,checkoutLeadId:'public-demo-northline',config:state.published||state.draft,...(state.published||state.draft)});
    if(path==='/api/rose-email-approvals')return response({ok:true,approvals:[],items:[]});
    if(path==='/api/rose-workflow-runs')return response({ok:true,runs:state.runs});
    if(path==='/api/voice/voices')return response({ok:true,voices:[{voiceId:'sample',name:'Sample Rose',description:'Voice calls are not placed in this demo.'}]});
    if(path==='/api/rose-workflows'){
      if(method==='GET')return response({ok:true,workflows:state.workflows});
      let wf=clone(body.workflow||{});wf.id=wf.id||crypto.randomUUID();wf.testing=false;
      if(body.action==='delete'){state.workflows=state.workflows.filter(x=>x.id!==wf.id);save();return response({ok:true});}
      if(body.action==='test'){
        wf.lastTestPreview={sample:true,lead:{name:'Jordan Sample',email:'visitor@example.invalid',summary:'EV charger quote request'},steps:(wf.planSteps||wf.nodes||wf.steps||[]).map(x=>({...typeof x==='string'?{label:x}:x,ok:true,simulated:true}))};
        wf.testEvents=[...(wf.testEvents||[]),{ok:true,mode:'runtime_dry_run',createdAt:now(),sample:true}];
        wf.status='Ready to publish';
      }
      if(['activate','publish'].includes(body.action)){wf.active=true;wf.status='Active';wf.activationState='active';}
      if(['pause','deactivate'].includes(body.action)){wf.active=false;wf.status='Inactive';}
      state.workflows=[wf,...state.workflows.filter(x=>x.id!==wf.id)];save();
      return response({ok:true,workflow:wf,workflows:state.workflows,preview:wf.lastTestPreview,sample:true});
    }
    if(path==='/api/rose-workflow-sample'){
      const wf=state.workflows.find(x=>x.id===body.workflowId);if(!wf)return response({error:'Sample workflow not found'},404);
      const channel=body.channel||'email';wf.sampleDeliveries=wf.sampleDeliveries||{};
      const sample=body.action==='confirm'?{...wf.sampleDeliveries[channel],status:body.received?'received':'not_received'}:{id:crypto.randomUUID(),to:body.to||'owner@example.invalid',channel,status:'sent',delivered:false,simulated:true};
      wf.sampleDeliveries[channel]=sample;save();
      return response({ok:true,sample,workflow:wf,message:'Sample delivery simulated. No message was sent.',simulated:true});
    }
    if(path==='/api/chat/start'){state.chat=[];save();return response({chatId:'public-sample-chat',client:{businessName:state.draft.settings.businessName}});}
    if(path==='/api/chat/message'){
      const content=String(body.content||'').slice(0,1600);state.chat.push({role:'user',content});
      const r=await nativeFetch('/demo/api/chat',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:content,history:state.chat.slice(-12),config:state.draft,notes:state.notes})});
      const data=await r.json();if(!r.ok)return response(data,r.status);
      state.chat.push({role:'assistant',content:data.reply});save();
      return response({ok:true,messages:[{role:'agent',content:data.reply}],reply:data.reply});
    }
    if(path==='/api/rose/command'||path==='/api/rose-workflow-message-draft'){
      body.config={...(body.config||{}),demoConnections:state.connections.map(x=>x.toolkit)};
      return nativeFetch('/demo/api/command',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    }
    if(path==='/api/rose-workflow-message-preview')return response({ok:true,subject:body.subject||'Sample lead request',body:body.body||'Jordan Sample asked for an EV charger quote.',sample:true});
    // Never fall through to an account, OAuth, payment, email, SMS or voice endpoint.
    return response({ok:false,error:'This action affects a real account and is not performed in the sample workspace.',sample:true},409);
  };
  window.fetch = async (input,init={}) => {
    const u=new URL(typeof input==='string'?input:input.url,location.href);
    const method=(init.method||input?.method||'GET').toUpperCase();
    if(u.pathname.startsWith('/api/')){
      let body={};try{body=JSON.parse(init.body||'{}')}catch{return response({error:'Invalid sample request'},400)}
      return api(u.pathname,body,method);
    }
    if(u.origin===location.origin&&u.pathname.startsWith(new URL('./',location.href).pathname)&&method==='GET')return nativeFetch(input,{...init,credentials:'omit'});
    return response({ok:false,error:'External requests are disabled in the sample workspace.'},409);
  };
  window.roseDemo={
    state:()=>clone(state),
    async connect(meta){state.connections=state.connections.filter(x=>x.toolkit!==meta.slug);state.connections.push({id:'sample-'+meta.slug,toolkit:meta.slug,displayName:meta.name,status:'connected',lastEvent:'sample_connected',sample:true});save();},
    reset(){store.clear();location.reload();}
  };
  navigator.sendBeacon=()=>false;
  window.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('resetPublicDemo')?.addEventListener('click',()=>window.roseDemo.reset());
    document.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&/northline\.example|login\.html|signup|reset\//.test(a.href)){e.preventDefault();alertDemo('Use the fictional business in this sample. No real account is connected.');}},true);
    document.querySelectorAll('[data-voice-start],.wr-start-voice').forEach(button=>button.title='Voice calls are not placed in this demo. Try Chat.');
  });
  function alertDemo(text){const toast=document.getElementById('toast');if(toast){toast.textContent=text;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3500);}}
})();

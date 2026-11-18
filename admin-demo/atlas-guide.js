/* Atlas's bounded navigation adapter. The catalog declares real UI capabilities;
   questions about facts continue to the live assistant. No controls are clicked here. */
(function(root){
  const singular={developers:'developer',updates:'update',keys:'key',tokens:'token',credentials:'credential',members:'member',teammates:'teammate',users:'user',people:'member',workflows:'workflow',automations:'automation',integrations:'integration',connections:'connection',apps:'app',webhooks:'webhook',endpoints:'endpoint',settings:'setting',preferences:'preference',notifications:'notification',events:'event',sessions:'session',repositories:'repository',docs:'documentation'};
  function normalize(value){return String(value||'').toLowerCase().replace(/[’']/g,'').replace(/\bwheres\b/g,'where is').replace(/\bapi[_-]?keys?\b/g,'api key').replace(/\bweb[ -]hook(s?)\b/g,'webhook$1').replace(/\bgit[ -]hub\b/g,'github').replace(/\b2fa\b/g,'two factor').replace(/\bset\s*up\b/g,'setup').replace(/\btime\s*zone\b/g,'timezone').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).map(w=>singular[w]||w).join(' ');}
  const includes=(text,phrase)=>(' '+text+' ').includes(' '+normalize(phrase)+' ');
  const command=/\b(create|generate|rotate|revoke|regenerate|rename|upgrade|downgrade|export|import|download|archive|cancel|pay|purchase|refund|send|logout|signout|log out|sign out|switch|make|build|new|invite|add|connect|disconnect|link|unlink|remove|delete|edit|change|update|save|reset|clear|restart|enable|disable|configure|set|setup|reveal|hide|mask|copy|forgot|lost|turn off|turn on|start over)\b/;
  function resolve(message,catalog,context={}){
    const raw=String(message||'').trim(),text=normalize(raw);
    if(/^(?:go |take me )?back(?: to (?:the )?(?:last|previous) page)?$/.test(text))return context.canGoBack?{type:'back',message:'Going back to your previous Atlas page.',choices:[]}:{type:'clarify',message:'Which Atlas section would you like to open?',choices:(catalog.tools||[]).filter(t=>['atlas-overview','atlas-integrations','atlas-settings'].includes(t.id))};
    if(/^(?:cancel(?: (?:the )?(?:guide|step))?|close (?:this |the )?(?:dialog|step))$/.test(text))return{type:'dismiss',message:'Step closed. You can choose another task.',choices:[]};
    if(/^(?:end|stop|hang up)(?: (?:the |my )?(?:voice|call|conversation|talking)){1,3}$/.test(text))return{type:'end-voice',choices:[]};
    if(!text||/^(pause|stop|resume|continue)( the)?( guide| guidance)?$/.test(text))return null;
    const dynamic=(context.workflows||[]).map((workflow,index)=>({id:'atlas-workflow-details-'+index,title:workflow.name,url:'./#overview',target:`[data-workflow-index="${index}"]`,subjects:[workflow.name],actions:[],default:true,completion:'open'}));
    const dynamicKeys=(context.keys||[]).flatMap((key,index)=>['reveal','hide'].map(action=>({id:`atlas-key-${action}-${index}`,title:`${action==='hide'?'Hide':'Reveal'} ${key.name} API key`,url:'./#developers/api-keys',target:`[data-reveal-key="${index}"]`,subjects:[key.name],actions:action==='hide'?['hide','mask']:['reveal','find','copy'],default:action==='reveal',keyState:!!key.revealed,keyAction:action})));
    const all=[...(catalog.tools||[]).filter(t=>t.enabled!==false),...dynamic,...dynamicKeys];
    const semanticTitle=task=>normalize(task.title).split(' ').filter(w=>!['view','show','find','my','your','and','details','preview','sample','create','connect','disconnect','setup','manage','invite','edit','reveal','hide','reset','change'].includes(w)).join(' ');
    const subjectMatches=all.map(task=>({task,specificity:Math.max(0,...[semanticTitle(task),...(task.subjects||[])].filter(s=>s&&includes(text,s)).map(s=>normalize(s).split(' ').length*10+normalize(task.title).split(' ').filter(w=>!['view','show','find','my','your','and','details','preview','sample','create','connect','disconnect','setup','manage','invite','edit','reveal','hide','reset','change'].includes(w)&&includes(text,w)).length))})).filter(x=>x.specificity);
    const factual=/^(what|whats|why|who|when|how many|how much|is |are |does |do i )/.test(text)&&!command.test(text)&&!/^(what|whats) (is )?(my|the) (api key|timezone)/.test(text);
    if(factual)return null;
    if(/\b(delete|remove|revoke|rotate|regenerate|rename)\b/.test(text)&&/\b(api key|access token|workflow|account|member|webhook|endpoint)\b/.test(text))return{type:'unsupported',message:'That change isn’t available in this sample workspace. I can guide you through the actions Atlas actually provides:',choices:all.filter(t=>['atlas-create-key','atlas-workflow','atlas-members','atlas-webhooks'].includes(t.id))};
    const named=dynamic.filter(task=>includes(text,task.title));
    if(named.length&&!/^(?:please )?(?:create|make|build|add)\b/.test(text))return named.length===1?{type:'guide',tool:named[0]}:{type:'clarify',message:'Which workflow?',choices:named};
    if(includes(text,'invite')&&!/\b(create|generate|connect|disconnect|delete|change)\b/.test(text))return{type:'guide',tool:all.find(t=>t.id==='atlas-team')};
    const namedKey=dynamicKeys.filter(task=>includes(text,task.subjects[0]));
    if(namedKey.length&&/\b(key|token|credential)\b/.test(text)){
      const action=/\b(hide|mask)\b/.test(text)?'hide':'reveal';const matches=namedKey.filter(t=>t.keyAction===action);
      if(matches.length>1)return{type:'clarify',message:'Which sample key?',choices:matches};
      const tool=matches[0];if(tool){if((action==='hide')!==tool.keyState)return{type:'status',message:`That sample key is already ${tool.keyState?'revealed':'hidden'}.`,choices:[]};return{type:'guide',tool};}
    }
    const actionMatches=subjectMatches.filter(({task})=>(task.actions||[]).some(action=>!['view','check','manage'].includes(action)&&!(action==='new'&&/\b(show|view|see|find|open)\b/.test(text))&&includes(text,action)));
    if(subjectMatches.some(x=>x.task.readOnly)&&/\b(change|edit|update|set|rename|delete|remove)\b/.test(text)&&Math.max(...subjectMatches.filter(x=>x.task.readOnly).map(x=>x.specificity))>=Math.max(0,...actionMatches.map(x=>x.specificity)))return{type:'unsupported',message:'That account field is read-only in this sample workspace. You can view it here:',choices:subjectMatches.filter(x=>x.task.readOnly).map(x=>x.task)};
    if(!actionMatches.length&&subjectMatches.length&&command.test(text)){
      const categories=new Set(subjectMatches.filter(x=>x.task.default&&x.task.completion==='page').map(x=>x.task.category).filter(Boolean));
      const related=all.filter(task=>categories.has(task.category)&&(task.actions||[]).some(action=>includes(text,action)));
      if(related.length)return{type:'clarify',message:'Which available action would you like?',choices:related};
    }
    if(!actionMatches.length&&subjectMatches.length&&command.test(text))return{type:'unsupported',message:'That action isn’t provided by this sample workspace. Here are the available options for that section:',choices:subjectMatches.map(x=>x.task).slice(0,6)};
    let ranked=actionMatches.length?actionMatches:subjectMatches.filter(x=>x.task.default);
    const navigation=/\b(where|show|see|view|open|go|take|find|locate|manage|check|back|browse)\b/.test(text)||all.some(t=>normalize(t.title)===text||(t.subjects||[]).some(s=>normalize(s)===text));
    if(!ranked.length){if((command.test(text)||navigation)&&!/^what|^why|^when/.test(text))return{type:'unsupported',message:'I couldn’t match that action to an Atlas control. Choose a section and I’ll guide you to what’s available:',choices:all.filter(t=>['atlas-overview','atlas-activity','atlas-members','atlas-developers','atlas-integrations','atlas-settings'].includes(t.id))};return null;}
    if(!actionMatches.length&&!navigation&&!command.test(text)&&!/^how (do|can)|^help|^i (need|want|would)/.test(text))return null;
    ranked.sort((a,b)=>b.specificity-a.specificity);
    let best=ranked.filter(x=>x.specificity===ranked[0].specificity).map(x=>x.task);
    if(!actionMatches.length&&/\b(details|detail)\b/.test(text)&&includes(text,'workflow')&&!dynamic.some(t=>includes(text,t.title)))return{type:'clarify',message:'Which workflow would you like to inspect?',choices:dynamic};
    // A reference to two separate subjects should never silently select one.
    const distinct=best.filter((task,index,items)=>items.findIndex(t=>t.target===task.target&&t.url===task.url)===index);
    if(distinct.length>1)return{type:'clarify',message:'Which part would you like to open?',choices:distinct};
    const tool=distinct[0];if(!tool)return null;
    if(tool.id==='atlas-stripe-manage'&&!context.stripe)return{type:'status',message:'Stripe is not connected yet. You can preview the sample connection setup:',choices:all.filter(t=>t.id==='atlas-stripe')};
    if(tool.id==='atlas-stripe'&&context.stripe)return{type:'status',message:'Stripe is already connected in this sample workspace.',choices:all.filter(t=>['atlas-stripe-manage','atlas-stripe-disconnect'].includes(t.id))};
    if(tool.id==='atlas-stripe-disconnect'&&!context.stripe)return{type:'status',message:'Stripe is already disconnected.',choices:all.filter(t=>t.id==='atlas-stripe')};
    if(tool.id==='atlas-hide-key'&&!context.keyRevealed)return{type:'status',message:'The sample API key is already hidden.',choices:all.filter(t=>t.id==='atlas-api-key')};
    if(tool.id==='atlas-api-key'&&context.keyRevealed)return{type:'status',message:'The sample key is already revealed. You can hide it again:',choices:all.filter(t=>t.id==='atlas-hide-key')};
    return{type:'guide',tool};
  }
  if(typeof module!=='undefined'&&module.exports){module.exports={normalize,resolve};return;}
  const source=new URL('./rose-tools.json?v=atlas-8',document.currentScript.src);
  const ready=fetch(source).then(r=>{if(!r.ok)throw Error('Atlas task catalog unavailable');return r.json();});
  const guide=root.__roseSiteGuide={version:'atlas-8',async resolve(message){return resolve(message,await ready,root.__atlasDemoContext?.()||{});}};
  ready.then(catalog=>guide.capabilities=catalog.tools.map(t=>t.title)).catch(()=>{});
})(globalThis);

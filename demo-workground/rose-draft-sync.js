(function(root){
  function stableStringify(value){return JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.keys(item).sort().reduce((out,key)=>{out[key]=item[key];return out},{}):item)}
  function canonicalDraftContent(config){
    const pick=(obj,keys)=>Object.fromEntries(keys.map(key=>[key,obj?.[key]??null])),list=key=>Array.isArray(config?.[key])?config[key]:[];
    return stableStringify({appearance:{...pick(config?.appearance,['assistantName','greetingMessage','brandPrimary','brandAccent','backgroundColor','textColor','bubbleColor','buttonColor','avatarUrl','logoPrompt']),widgetCopy:config?.appearance?.widgetCopy&&typeof config.appearance.widgetCopy==='object'?config.appearance.widgetCopy:{}},settings:pick(config?.settings,['businessName','website','ownerName','ownerEmail','backupEmail','phone','voiceId']),context:list('context').map(n=>String(typeof n==='string'?n:n?.text||'').trim()).filter(Boolean).sort(),connections:list('connections').map(c=>[c?.provider||'',c?.label||'',c?.status||''].join('|')).sort(),workflows:list('workflows').map(w=>[w?.id||'',w?.title||w?.name||''].join('|')).sort(),builderHistory:list('builderHistory').map(m=>[m?.role||'',m?.content||'',m?.at||''].join('|'))});
  }
  class RoseDraftSync {
    constructor({send,snapshot,onState,rehydrate}){this.rehydrate=rehydrate||null;this.send=send;this.snapshot=snapshot;this.onState=onState;this.revision=null;this.saved='';this.tail=Promise.resolve();this.blocked=false;this.pending=0;}
    hydrate(revision,snapshot){this.revision=Number(revision||0);this.saved=JSON.stringify(snapshot);this.blocked=false;}
    dirty(){return this.saved!==JSON.stringify(this.snapshot());}
    async recoverConflict(frozen){
      if(typeof this.rehydrate!=='function')return false;let latest;try{latest=await this.rehydrate()}catch{return false}
      if(!latest||!Number.isSafeInteger(latest.revision)||!latest.draft||typeof latest.draft!=='object'||Array.isArray(latest.draft))return false;
      const serverContent=canonicalDraftContent(latest.draft),frozenContent=canonicalDraftContent(frozen);let savedContent=null;try{savedContent=canonicalDraftContent(JSON.parse(this.saved))}catch{}
      if(serverContent===savedContent||serverContent===frozenContent){this.revision=Number(latest.revision);return true}return false;
    }
    save(snapshot=this.snapshot(),action='save'){
      const frozen=JSON.parse(JSON.stringify(snapshot));this.pending++;
      const task=this.tail.catch(()=>{}).then(async()=>{
        if(this.blocked)throw Error('A newer draft exists. Reload to review both versions before saving.');
        if(this.revision===null)throw Error('Wait for your account to finish loading before saving.');
        this.onState('Saving…');
        try{const result=await this.send({action,draft:frozen,baseRevision:this.revision});this.revision=result.revision;this.saved=JSON.stringify(frozen);this.onState(this.dirty()?'Draft unsaved':'Draft saved');return result;}
        catch(error){
          if(error.status===409&&await this.recoverConflict(frozen)){
            try{const result=await this.send({action,draft:frozen,baseRevision:this.revision});this.revision=result.revision;this.saved=JSON.stringify(frozen);this.onState(this.dirty()?'Draft unsaved':'Draft saved after a refresh');return result;}
            catch(retryError){if(retryError.status===409)this.blocked=true;this.onState(retryError.status===409?'Draft conflict — reload to review':'Draft local — not synced');throw retryError;}
          }
          if(error.status===409)this.blocked=true;this.onState(this.blocked?'Draft conflict — reload to review':'Draft local — not synced');throw error;
        }
      });
      this.tail=task;task.finally(()=>{this.pending--}).catch(()=>{});return task;
    }
  }
  root.RoseDraftSync=RoseDraftSync;
})(typeof window==='undefined'?globalThis:window);

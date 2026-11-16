/* Select the existing backend's isolated preview mode. Rose's widget, chat,
   voice, and navigation engine are used without modification. */
(() => {
  const originalFetch=window.fetch.bind(window);
  window.fetch=(input,init)=>{
    const url=typeof input==='string'?input:input?.url||'';
    if(/^https:\/\/wildrose-widget\.wildeautomations\.com\/api\/(?:chat|voice)\/start$/.test(url)&&init?.body){
      const payload=JSON.parse(init.body);
      delete payload.businessId;delete payload.clientId;delete payload.ownerEmail;
      payload.previewMode=true;payload.prospectPreview=true;
      return originalFetch(input,{...init,body:JSON.stringify(payload)});
    }
    return originalFetch(input,init);
  };
})();

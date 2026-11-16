/* Use the existing Rose runtime and backend in their isolated preview mode.
   The Atlas application is a sample workspace; no lead or live account is changed. */
(() => {
  const originalFetch=window.fetch.bind(window);
  window.fetch=(input,init)=>{
    const url=typeof input==='string'?input:input?.url||'';
    if(/^https:\/\/rose-pilot\.wildroseautomations\.ca\/api\/(?:chat|voice)\/start$/.test(url)&&init?.body){
      const payload=JSON.parse(init.body);
      delete payload.businessId;delete payload.clientId;delete payload.ownerEmail;
      payload.previewMode=true;payload.prospectPreview=true;
      return originalFetch(input,{...init,body:JSON.stringify(payload)});
    }
    return originalFetch(input,init);
  };
})();

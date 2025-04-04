sap.ui.define([
    "sap/ui/core/mvc/Controller"
  ], (BaseController) => {
    "use strict";
  
    return BaseController.extend("crudoperation.controller.Details", {
        onInit() {
            
            const oRouter = this.getOwnerComponent().getRouter()
            console.log(oRouter)
            const idParameter = oRouter.getHashChanger().hash.slice(-1)
        }
    });
  });
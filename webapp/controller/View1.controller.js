sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], (Controller, DateFormat, JSONModel, Filter, Sorter, MessageToast, MessageBox, Fragment) => {
    "use strict";
    return Controller.extend("crudoperation.controller.View1", {
        onInit() {
            this.oDateFormatter = DateFormat.getDateInstance({pattern: "yyyy-MM-dd HH:mm:ss"});
            this.onReadAll();
            
        },
        
        // Formatter for Categories
        formatCategories: function(aCategories) {
            if (!aCategories) {
                return "No Category Specified.";
            }
            return aCategories
        },
        
        // Formatter for Supplier
        formatSupplier: function(oSupplier) {
            if (!oSupplier) {
                return "No supplier Provided";
            }
            return oSupplier;
        },
        
        onReadAll: function() {
            const that = this;
            const oModel = this.getOwnerComponent().getModel();
            
            // Add $expand parameter to include related entities
            oModel.read("/Products", {
                urlParameters: {
                    "$expand": "Category,Supplier"
                },
                success: function(odata) {
                    odata.results.forEach(result => {
                        result.ReleaseDate = that.oDateFormatter.format(new Date(result.ReleaseDate));
                    });
                    const jModel = new JSONModel(odata);
                    that.getView().byId("idProducts").setModel(jModel);
                },
                error: function(oError) {
                    MessageToast.show(oError.message);
                }
            });
        },
        
        onFilter: function() {
            const that = this;
            const oModel = this.getOwnerComponent().getModel();
            const oFilter = new Filter("Rating", "EQ", "4");
            
            oModel.read("/Products", {
                filters: [oFilter],
                urlParameters: {
                    "$expand": "Category,Supplier"
                },
                success: function(odata) {
                    odata.results.forEach(result => {
                        result.ReleaseDate = that.oDateFormatter.format(new Date(result.ReleaseDate));
                    });
                    const jModel = new JSONModel(odata);
                    that.getView().byId("idProducts").setModel(jModel);
                },
                error: function(oError) {
                    MessageToast.show(oError.message);
                }
            });
        },
        
        onSort: function() {
            const that = this;
            const oModel = this.getOwnerComponent().getModel();
            const oSort = new Sorter("Price", true);
            
            oModel.read("/Products", {
                sorters: [oSort],
                urlParameters: {
                    "$expand": "Category,Supplier"
                },
                success: function(odata) {
                    odata.results.forEach(result => {
                        result.ReleaseDate = that.oDateFormatter.format(new Date(result.ReleaseDate));
                    });
                    const jModel = new JSONModel(odata);
                    that.getView().byId("idProducts").setModel(jModel);
                },
                error: function(oError) {
                    MessageToast.show(oError.message);
                }
            });
        },
        
        onReadParameters: function() {
            const that = this;
            const oModel = this.getOwnerComponent().getModel();
            const oparams = {
                "$skip": 2,
                "$top": 5,
                "$expand": "Category,Supplier"
            };
            
            oModel.read("/Products", {
                urlParameters: oparams,
                success: function(odata) {
                    odata.results.forEach(result => {
                        result.ReleaseDate = that.oDateFormatter.format(new Date(result.ReleaseDate));
                    });
                    const jModel = new JSONModel(odata);
                    that.getView().byId("idProducts").setModel(jModel);
                },
                error: function(oError) {
                    MessageToast.show(oError.message);
                }
            });
        },
        
        onReadOneWithId: function() {
            const that = this;
            const oModel = this.getOwnerComponent().getModel();
            
            oModel.read("/Products(4)", {
                urlParameters: {
                    "$expand": "Category,Supplier"
                },
                success: function(odata) {
                    odata.ReleaseDate = that.oDateFormatter.format(new Date(odata.ReleaseDate));
                    const jModel = new JSONModel({results: [odata]});
                    that.getView().byId("idProducts").setModel(jModel);
                },
                error: function(oError) {
                    MessageToast.show(oError.message);
                }
            });
        },
        
        onEdit: function(oEvent) {
            const that = this;
            const btnReference = oEvent.getSource();
            const inputReference = btnReference.getParent().getParent().getCells()[5];
            const oModel = this.getOwnerComponent().getModel();
            oModel.setUseBatch(false);
            
            if(btnReference.getText() === "Edit") {
                btnReference.setText("Submit");
                inputReference.setEditable(true);
            } else {
                btnReference.setText("Edit");
                inputReference.setEditable(false);
                const inputNewValue = inputReference.getValue();
                const updatedDataId = btnReference.getBindingContext().getProperty("ID");
                
                oModel.update(`/Products(${updatedDataId})`, {Price: inputNewValue}, {
                    success: function(oData) {
                        MessageToast.show("Product Price Updated Successfully", {
                            my: "center top", 
                            at: "center top",  
                            width: "17rem"
                        });
                        that.onReadAll();
                    }, 
                    error: function(oError) {
                        MessageToast.show(oError.message);
                    }
                });
            }
        },
        
        onDelete: function(oEvent) {
            const that = this;
            const oSelectedItem = oEvent.getSource().getBindingContext().getProperty("ID");
            
            if (!oSelectedItem) {
                MessageToast.show("Please select a product to delete.");
                return;
            }
            
            MessageBox.confirm("Are you sure you want to delete this record?", {
                actions: ["OK", "Cancel"],
                onClose: (action) => that.rCallAlertBack(action, oSelectedItem)
            });
        },
        
        rCallAlertBack: function(rValue, selectedId) {
            const that = this;
        
            if (rValue === "OK") { 
                const oModel = this.getOwnerComponent().getModel();
                
                oModel.setUseBatch(false);
                oModel.remove(`/Products(${selectedId})`, {
                    success: function(oData) {
                        MessageToast.show("Product Deleted Successfully", {
                            my: "center top", 
                            at: "center top",  
                            width: "17rem"
                        });
                        that.onReadAll(); 
                    },
                    error: function(oError) {
                        MessageToast.show(oError.message);
                    }
                });
            }
        },
        
        onCreate: function(objectToInsert, oModel, fragmentToClose) {
                oModel.create("/Products", objectToInsert, {
                    success: function(oData) {
                        MessageToast.show("Product Created Successfully", {
                            my: "center top", 
                            at: "center top",  
                            width: "17rem"
                        });
                        fragmentToClose.close()
                        that.onReadAll();
                    }, 
                    error: function(oError) {
                        console.log(oError)
                        MessageToast.show(oError.message);
                    }
                }); 
                
             
            },
        
        handleSelectionChange: function(oEvent) {
            const oContext = oEvent.getParameter("listItem").getBindingContext().getObject();
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Details", {
                productId: oContext.ID
            });
        },
        onShowDialog: function () {
            if (!this.oDialogModel) {
                this.oDialogModel = new JSONModel({
                    name: "",
                    description: "",
                    releaseDate:"",
                    rating: "",
                    price: "",
                    category: "",
                    supplier: ""
                });
            }
            if (!this.createProductDialog) {
                Fragment.load({
                    name: "crudoperation.view.fragments.AddProduct",
                    controller: this
                }).then(function(oDialog) {
                    this.createProductDialog = oDialog;
                    this.createProductDialog.setModel(this.oDialogModel);
                    this.getView().addDependent(this.createProductDialog);
                    
                    // Open the dialog
                    this.createProductDialog.open();
                }.bind(this));
            } else {
                
                this.oDialogModel.setData({
                    name: "",
                    description: "",
                    releaseDate:"",
                    rating: "",
                    price: "",
                    category: "",
                    supplier: ""
                });
                this.createProductDialog.open();
            }
        },
    
        onOkPress: function () {
            try {

                const oFormData = this.oDialogModel.getData();
                
                console.log("Form Data:", oFormData);
                
                // Validate input
                if (!oFormData.name || !oFormData.description || !oFormData.rating || 
                    !oFormData.price || !oFormData.category || !oFormData.supplier) {
                    MessageToast.show("Please fill in all required fields.", {
                        at:"center top"
                    });
                    return;
                }
                
                const oModel = this.getOwnerComponent().getModel();
                oModel.setUseBatch(false);
                
                const newProduct = {
                    ID: 401,
                    Name: oFormData.name,
                    Description: oFormData.description,
                    ReleaseDate: oFormData.releaseDate,
                    Rating: oFormData.rating,
                    Price: oFormData.price,
                    Category: {
                        ID:57,
                        Name: oFormData.category
                    },
                    Supplier: {
                        ID: 77,
                        Name: oFormData.supplier,
                        Address: {
                            City: "Default City",
                            Country: "Default Country",
                            State: "Default State",
                            Street: "Default Street",
                            ZipCode: "0000"
                        }
                    }
                };
                const that = this
                this.onCreate(newProduct, oModel,  that.createProductDialog)
                
            } catch (error) {
                console.error("Error in onOkPress:", error);
                MessageToast.show("Error processing form data. See console for details.");
            }
        },
    
        onCancelPress: function () {
            this.createProductDialog.close(); 
        },
        onViewDetails: function(oEvent) {
            const oListItem = oEvent.getParameter("listItem");
            const oContext = oListItem.getBindingContext();
            const oProduct = oContext.getObject();
            console.log(oProduct)
            const jModel = new JSONModel({ results: [oProduct] });
            this.getView().byId("productDetailTable").setModel(jModel);
        },
        
    });
});
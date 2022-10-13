sap.ui.define([
    "legacy/dashboard/controller/BaseController",
    "legacy/dashboard/utils/formatter",
    'sap/m/MessageToast',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel", 
   
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController,formatter, MessageToast, Filter, FilterOperator, JSONModel) {
        "use strict";

        return BaseController.extend("legacy.dashboard.controller.PedidosList", {
            formatter: formatter,
            onInit: function(){
                this.getView().getModel("estados")
                this.getView().getModel("data")

                var oRouter = this.getRouter();
                oRouter.getRoute("PedidosList").attachMatched(this._onRouteMatched, this);
                
                this._mFilters = {
                    "prepagoPendiente": [new Filter("StatusPedido", FilterOperator.EQ, 1)],
                    "liberado": [new Filter("StatusPedido", FilterOperator.EQ,2)],
                    "vencido": [new Filter("StatusPedido", FilterOperator.EQ, 3)],
                    "cancelado":[new Filter("StatusPedido", FilterOperator.EQ, 4)],
                    "all": []
                };
            },
            _onRouteMatched: function (oEvent) {
                       },
            onQuickFilter: function(oEvent) {
                var oBinding = this.getView().byId("idTablaPedidos").getBinding("items"),
                    sKey = oEvent.getParameter("selectedKey");
                    oBinding.filter(this._mFilters[sKey]);
            }           
        });
    });

     
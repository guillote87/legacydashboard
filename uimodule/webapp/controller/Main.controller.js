sap.ui.define([
    "legacy/dashboard/controller/BaseController",
    "legacy/dashboard/utils/formatter",
    'sap/m/MessageToast',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, formatter, MessageToast, Filter, FilterOperator, JSONModel) {
        "use strict";

        return BaseController.extend("legacy.dashboard.controller.Main", {
            formatter: formatter,
            onInit: function () {
                this.getOwnerComponent().setModel(new JSONModel({}), "data")
                this.getOwnerComponent().setModel(new JSONModel({}), "estados")
                this.getOwnerComponent().setModel(new JSONModel({}), "meses")
               
            },
            pressPedidos: function () {
                this.getRouter().navTo("PedidosList", {
                    orgVenta: this.getView().byId("orgventa").getValue()
                });
            },
            pressMonth: function (oEvent) {
                this.getRouter().navTo("Month", {
                    orgVenta: this.getView().byId("orgventa").getValue()
                });
            },
            pressMonthStacked: function (oEvent) {
                this.getRouter().navTo("MonthStacked", {
                    orgVenta: this.getView().byId("orgventa").getValue()
                });
            },
            onDisplayNotFound: function () {
                MessageToast.show("WTF")
                //display the "notFound" target without changing the hash
                this.getRouter().getTargets().display("notFound", {
                    fromTarget: "RouteView1"
                });
            },            
            onSearch2: function () {
                this.getView().byId("orgVentaTitle").setText(this.getView().byId("orgventa").getValue())
               
              
                var dialog = new sap.m.BusyDialog({
                    text: 'Cargando Datos...'
                })           
                dialog.open();


                var oDataModel = this.getView().getModel();
               
                oDataModel.read("/SetPedidos", {
                    filters: [new Filter("OrgVentas", FilterOperator.EQ, this.getView().byId("orgventa").getValue()),
                    new Filter("StatusPedido", FilterOperator.EQ, "1"),
                    new Filter("StatusPedido", FilterOperator.EQ, "2"),
                    new Filter("StatusPedido", FilterOperator.EQ, "3"),
                    new Filter("StatusPedido", FilterOperator.EQ, "4")],

                    success: function (args) {
                      
                       var count = [
                            {
                                "id": "1",
                                "count": 0
                            },
                            {
                                "id": "2",
                                "count": 0
                            },
                            {
                                "id": "3",
                                "count": 0
                            },
                            {
                                "id": "4",
                                "count": 0
                            }]


                        for (var i = 0; i < args.results.length; i++) {
                            {
                                var StatusPedido = args.results[i].StatusPedido
                                var contains = count.find(v => v.id === StatusPedido);
                                if (contains) {
                                    contains.count++;
                                    
                                } else {
                                    count.push({ count: 1 });
                                }
                            }
                        }
                        count.sort((a, b) => {
                            if (a.StatusPedido == b.StatusPedido) {
                                return 0;
                            }
                            if (a.StatusPedido < b.StatusPedido) {
                                return -1;
                            }
                            return 1;
                        });
                        count.push({ total: args.results.length})
                       

                        this.getView().getModel("estados").setData(count)

                        var months = []
                        var monthNames = [
                            "Enero", "Febrero", "Marzo",
                            "Abril", "Mayo", "Junio",
                            "Julio", "Agosto", "Septiembre",
                            "Octubre", "Noviembre", "Diciembre"
                        ];
                        for (var i = 0; i < args.results.length; i++) {
                            {
                                var date = args.results[i].FechaCreacion
                                var month = date.split(/[.]/)
                                var monthName = monthNames[Number(month[1]) - 1]

                                var contains = months.find(v => v.month === month[1]);
                                if (contains) {
                                    contains.count++;
                                } else {
                                    months.push({ monthName: monthName, month: month[1], count: 1 });
                                }
                            }
                        }
                        months.sort((a, b) => {
                            if (a.month == b.month) {
                                return 0;
                            }
                            if (a.month < b.month) {
                                return -1;
                            }
                            return 1;
                        });
                      
                        this.getView().getModel("meses").setData(months)
                        this.getView().getModel("data").setData(args)
                  
                    
                       
                        var Test = []

                      
                        dialog.close();

                    }.bind(this)
                });

            }
        });
    });


            /*     var dialog = new sap.m.BusyDialog({
                       text: 'Loading Data...'
                   })           
                   dialog.open();
   
                 jQuery.ajax({
                       url: "model/SetPedidos.json",
                       dataType: "json",
                       data: "",
                       success: function (jsn) {
                           var oJson = new sap.ui.model.json.JSONModel();
                           oJson.setData(jsn);
                           dialog.close()
                       },
   
                   })
            },

            onJson: function () {
                var oJson = this.getView().getModel("testing").getProperty("/results")
                var count = []
                for (var i = 0; i < oJson.length; i++) {
                    {
                        var StatusPedido = oJson[i].StatusPedido
                        var contains = count.find(v => v.StatusPedido === StatusPedido);
                        if (contains) {
                            contains.count++;
                        } else {
                            count.push({ StatusPedido: StatusPedido, count: 1 });
                        }
                    }
                }
                count.push({  total: oJson.length,orgVenta: oJson[0].OrgVenta })
console.log(count)
                this.getView().getModel("estados").setData(count)

                var months = []
                var monthNames = [
                    "Enero", "Febrero", "Marzo",
                    "Abril", "Mayo", "Junio",
                    "Julio", "Agosto", "Septiembre",
                    "Octubre", "Noviembre", "Diciembre"
                ];
                for (var i = 0; i < oJson.length; i++) {
                    {
                        var date = oJson[i].FechaCreacion
                        var month = date.split(/[.]/)
                        var monthName = monthNames[Number(month[1]) - 1]

                        var contains = months.find(v => v.month === month[1]);
                        if (contains) {
                            contains.count++;
                        } else {
                            months.push({ monthName: monthName, month: month[1], count: 1 });
                        }
                    }
                }
                months.sort((a, b) => {
                    if (a.month == b.month) {
                        return 0;
                    }
                    if (a.month < b.month) {
                        return -1;
                    }
                    return 1;
                });
                this.getView().getModel("meses").setData(months)*/
sap.ui.define([
    "legacy/dashboard/controller/BaseController",
    "legacy/dashboard/utils/formatter",
    "sap/ui/model/json/JSONModel"
], function (BaseController, formatter, JSONModel) {
    "use strict";

    return BaseController.extend("legacy.dashboard.controller.MonthStacked", {
        formatter: formatter,
        onInit: function () {
            this.getView().setModel(new JSONModel({}), "meses2")

            this.getView().getModel("data")

            var oRouter = this.getRouter();
            oRouter.getRoute("MonthStacked").attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
            this._onExport()
            var oVizFrame = this.getView().byId("idColumnStacked")
            oVizFrame.destroyFeeds(); //clean up the feeds and dataset binding before update
            oVizFrame.destroyDataset();

            var oDataset = new sap.viz.ui5.data.FlattenedDataset({
                dimensions: [{
                    name: 'Mes',
                    value: "{meses2>month}",
                     displayValue: "{meses>monthName}"
                }],

                measures: [{
                    name: "Prepago Pendiente",
                    value: "{estados/0/count}",

                }, {
                    name: "Liberado",
                    value: "{estados/1/count}",
                },
                {
                    name: "Vencido",
                    value: "{estados/2/count}",
                },
                {
                    name: "Cancelado",
                    value: "{estados/3/count}"
                }
                ],
                data: {
                    path: "meses2>/"
                }
            })
            oVizFrame.setDataset(oDataset)
            oVizFrame.setVizType('stacked_column')

            oVizFrame.setVizProperties({
                plotArea: {
                    colorPalette: ['blue','green','orange','red'],
                    dataLabel: {
                        showTotal: true
                    }
                },
                tooltip: {
                    visible: true
                },
                title: {
                    visible: "true",
                    text: "Pedidos Creados por Mes"
                },
                interaction: {
                    selectability: {
                        mode: "single"
                    }
                }
            })

            var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
                'uid': "valueAxis",
                'type': "Measure",
                'values': ["Prepago Pendiente"]
            }), feedValueAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
                'uid': "valueAxis",
                'type': "Measure",
                'values': ["Liberado"]
            }), feedValueAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
                'uid': "valueAxis",
                'type': "Measure",
                'values': ["Vencido"]
            }), feedValueAxis3 = new sap.viz.ui5.controls.common.feeds.FeedItem({
                'uid': "valueAxis",
                'type': "Measure",
                'values': ["Cancelado"]
            }),
                feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    'uid': "categoryAxis",
                    'type': "Dimension",
                    'values': ["Mes"]
                })
            oVizFrame.addFeed(feedValueAxis)
            oVizFrame.addFeed(feedValueAxis1)
            oVizFrame.addFeed(feedValueAxis2)
            oVizFrame.addFeed(feedValueAxis3)
            oVizFrame.addFeed(feedCategoryAxis)
        },
        _onExport: function () {
            var months = []
                                    var monthNames = [
                            "Enero", "Febrero", "Marzo",
                            "Abril", "Mayo", "Junio",
                            "Julio", "Agosto", "Septiembre",
                            "Octubre", "Noviembre", "Diciembre"
                        ];
            for (var i = 1; i <= 12; i++) {
                var monthName = monthNames[Number(i)-1]
              
                if (i < 10) {
                    months.push({ month: ("0" + i), monthName: monthName, data: this._getMonth(("0" + i)) })
                }
                else {
                    months.push({ month: "" + i, monthName: monthName, data: this._getMonth("" + i) })
                }

            }

            for (let i = 0; i < months.length; i++) {
                var count = [
                    {
                        "id": "1",
                        "Descripcion": "Prepago Pendiente",
                        "count": 0
                    },
                    {
                        "id": "2",
                        "Descripcion": "Liberado",
                        "count": 0
                    },
                    {
                        "id": "3",
                        "Descripcion": "Vencido",
                        "count": 0
                    },
                    {
                        "id": "4",
                        "Descripcion": "Cancelado",
                        "count": 0
                    }]

                months[i].data.map(function (i) {
                    var StatusPedido = i.StatusPedido
                    var contains = count.find(v => v.id === StatusPedido);
                    if (contains) {
                        contains.count++;
                    } else {
                        count.push({ count: 1 });
                    }
                }
                )
                months[i].estados = count

            }
            console.log(months)

            this.getView().getModel("meses2").setData(months)
        },
        myOnClickHandler: function (oEvent) {

            var clickedData = oEvent.getParameter("data")[0].data
            console.log(clickedData)
            var Mes = "." + clickedData.Mes + "."
            var table = this.getView().byId("idTabla");

            var oBinding = table.getBinding("items");

            var count = [
                {
                    "id": "1",
                    "Descripcion": "Prepago Pendiente",
                    "count": 0
                },
                {
                    "id": "2",
                    "Descripcion": "Liberado",
                    "count": 0
                },
                {
                    "id": "3",
                    "Descripcion": "Vencido",
                    "count": 0
                },
                {
                    "id": "4",
                    "Descripcion": "Cancelado",
                    "count": 0
                }]
         
                const id = count.findIndex(object => {
                    return object.Descripcion === clickedData.measureNames;
                  });
              let status = count[id].id
            var oFilters = [new sap.ui.model.Filter("FechaCreacion", sap.ui.model.FilterOperator.Contains, Mes),
            new sap.ui.model.Filter("StatusPedido", sap.ui.model.FilterOperator.EQ, status)];

            oBinding.filter(oFilters);
            // do something
        },
        _getMonth: function (month) {
            var data = this.getView().getModel("data")

            return data.oData.results.filter(v => (v.FechaCreacion.split(/[.]/))[1] === month)

        }
    })
})

sap.ui.define([
    "legacy/dashboard/controller/BaseController",
    "legacy/dashboard/utils/formatter",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
], function (BaseController, formatter,exportLibrary,Spreadsheet) {
    "use strict";
    var EdmType = exportLibrary.EdmType
    return BaseController.extend("legacy.dashboard.controller.Month", {
        formatter: formatter,
    
        onInit: function () {
            this.getView().getModel("meses")
            this.getView().getModel("data")

            var oRouter = this.getRouter();
            oRouter.getRoute("Month").attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
            var oVizFrame = this.getView().byId("idColumn")
            oVizFrame.destroyFeeds(); //clean up the feeds and dataset binding before update
            oVizFrame.destroyDataset();

            var oDataset = new sap.viz.ui5.data.FlattenedDataset({
                dimensions: [{
                    name: 'Mes',
                    value: "{meses>month}",
                    displayValue: "{meses>monthName}"
                }],

                measures: [{
                    name: "Pedidos",
                    value: "{meses>count}"
                }],

                data: {
                    path: "meses>/"
                }
            })
            oVizFrame.setDataset(oDataset)
            oVizFrame.setVizType('column')

            oVizFrame.setVizProperties({
                plotArea: {
                    dataPointStyle: {
                        "rules":
                            [
                                {
                                    "dataContext": { "Pedidos": { "max": 4000 } },
                                    "properties": {
                                        "color": "sapUiChartPaletteSemanticBad"
                                    },
                                    "displayName": "Pedidos < 4000"
                                }
                            ],
                        "others":
                        {
                            "properties": {
                                "color": "sapUiChartPaletteSequentialHue1"
                            },
                            "displayName": "Pedidos > 4000"
                        }
                    }
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
                'values': ["Pedidos"]
            }),
                feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    'uid': "categoryAxis",
                    'type': "Dimension",
                    'values': ["Mes"]
                })
            oVizFrame.addFeed(feedValueAxis)
            oVizFrame.addFeed(feedCategoryAxis)
        },
        onExport: function () {
            var month = []
            for (var i = 1; i <= 12; i++) {
                if (i < 10) {
                    month.push({ mes: ("0" + i), data: this._getMonth(("0" + i)) })
                }
                else {
                    month.push({ mes: "" + i, data: this._getMonth("" + i) })
                }

            }
            console.log(month)
           
            for (let i = 0; i < month.length; i++) {
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

                month[i].data.map(function (i) {
                    var StatusPedido = i.StatusPedido
                    var contains = count.find(v => v.id === StatusPedido);
                    if (contains) {
                        contains.count++;
                    } else {
                        count.push({ count: 1 });
                    }
                }
                )
                month[i].estados= count
        }

    console.log(month)

},
    myOnClickHandler: function (oEvent) {

        var clickedData = oEvent.getParameter("data")[0].data
        var Mes = "." + clickedData.Mes + "."
        var table = this.getView().byId("idTabla");

        var oBinding = table.getBinding("items");

        var oFilters = [new sap.ui.model.Filter("FechaCreacion", sap.ui.model.FilterOperator.Contains, Mes)];

        oBinding.filter(oFilters);
        // do something
    },
    _getMonth: function (month) {
        var data = this.getView().getModel("data")

        return data.oData.results.filter(v => (v.FechaCreacion.split(/[.]/))[1] === month)

    },
    createColumnConfig: function () {
        var aCols = [];
var columns = this.getView().byId("idTabla").getColumns()
var items = this.getView().byId("idTabla").getVisibleItems()[0].mAggregations.cells
console.log(items)

        for (var i=0; i <columns.length; i++){
            aCols.push({
                label: columns[i].mAggregations.header.mProperties.text,
                property : items[i].mBindingInfos.text.binding.sPath,
                type: EdmType + items[i].mBindingInfos.text.binding.sInternalType,
            })
        }
        return aCols;
     
    },

    onExport2: function () {
        var aCols, oRowBinding, oSettings, oSheet, oTable;

        if (!this._oTable) {
            this._oTable = this.byId('idTabla');
        }

        oTable = this._oTable;
        oRowBinding = oTable.getBinding('items');
        aCols = this.createColumnConfig();

        oSettings = {
            workbook: {
                columns: aCols,
                hierarchyLevel: 'Level'
            },
            dataSource: oRowBinding,
            fileName: 'Table export sample.xlsx',
            worker: false // We need to disable worker because we are using a MockServer as OData Service
        };

        oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(function () {
            oSheet.destroy();
        });
    },
    })
})

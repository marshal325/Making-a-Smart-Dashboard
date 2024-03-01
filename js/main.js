// 分配访问令牌  
mapboxgl.accessToken =
    'pk.eyJ1IjoiamFrb2J6aGFvIiwiYSI6ImNpcms2YWsyMzAwMmtmbG5icTFxZ3ZkdncifQ.P9MBej1xacybKcDN_jehvw';


let map = new mapboxgl.Map({
    container: 'map', // 容器ID  
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom: 2, // 初始缩放级别  
    center: [0, 0] // 初始中心点  
});

// 创建弹出框对象  
const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

// 初始化C3.js图表  
var earthquakeChart = c3.generate({
    bindto:"#chart1",
    size: {
        height: 300,
        width: 460
    },
    data: {
        x: 'mag',
        columns: [],
        type: 'line', // make a bar chart.
    },
    axis: {
        x: { //magnitude
            type: 'category',
        },
   
    },

});
var earthquakeChart2 = c3.generate({
    bindto:"#chart2",
    size: {
        height: 300,
        width: 460
    },
    data: {
        x: 'mag',
        columns: [],
        type: 'bar', // make a bar chart.
    },
    axis: {
        x: { //magnitude
            type: 'category',
        },
   
    },

});


map.on('load', () => {
    // 在地图加载完成后添加数据源和图层  
    fetch('../assets/COVID-19.geojson') // 假设这是您的COVID-19 GeoJSON数据文件的路径  
        .then(response => response.json())
        .then(data => {
            // 添加GeoJSON数据源  
            map.addSource('covid-data', {
                type: 'geojson',
                data: data
            });

            // 添加点图层，根据'cases'属性调整点的大小和颜色  
            map.addLayer({
                id: 'covid-points',
                type: 'circle',
                source: 'covid-data',
                paint: {
                    // 根据 cases 属性调整点的大小  
                    'circle-radius': {
                        'property': 'cases',
                        'stops': [
                            [0, 2],
                            [100, 5],
                            [1000, 10]
                        ]
                    },
                    // 根据 cases 属性调整点的颜色  
                    'circle-color': {
                        'property': 'cases',
                        'stops': [
                            [0, '#ffffff'],
                            [100, '#ffff00'],
                            [1000, '#ff0000']
                        ]
                    },
                    // 设置点的透明度  
                    'circle-opacity': 0.8
                }
            });

            // 添加点击事件监听器  
            map.on('click', 'covid-points', (e) => {
                const feature = e.features[0];
                if (feature) {
                    // 获取点击的点的信息  
                    const popupContent = `  
                        <h3>Location: ${feature.properties.country}</h3>  
                        <p>Cases: ${feature.properties.cases}</p>  
                    `;
                    const cases = feature.properties.cases;
                    const deaths = feature.properties.deaths;
                    const recovered = feature.properties.recovered;
                    const vaccinated = feature.properties.vaccinated;
                    // 使用C3.js更新图表数据  
                    earthquakeChart.load({
                        columns: [
                            ["mag","cases","deaths","recovered","vaccinated"],
                            ['#',cases,deaths,recovered,vaccinated]
                        ]
                    });
                    earthquakeChart2.load({
                        columns: [
                            ["mag","cases","deaths","recovered","vaccinated"],
                            ['#',cases,deaths,recovered,vaccinated]
                        ]
                    });

                    // 显示弹出框  
                    popup
                        .setLngLat(feature.geometry.coordinates)
                        .setHTML(popupContent)
                        .addTo(map);
                }
            });

        });

    // 添加一个关闭弹出框的事件监听器  
    map.on('mousemove', () => {
        popup.remove();
    });
});
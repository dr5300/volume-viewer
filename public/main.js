import * as RC from './lib/rendercore/src/RenderCore.js'
import {Float32Attribute, Geometry, Uint32Attribute, Color} from './lib/rendercore/src/RenderCore.js'
import {NRRDReader} from './lib/nrrd/NRRDReader.js';

const scannerVolumeInfoFileInput = document.getElementById('scannerVolumeInfoFileInput');
const scannerVolumeDataFileInput = document.getElementById('scannerVolumeDataFileInput');

const segmentationVolumeInfoFileInput = document.getElementById('segmentationVolumeInfoFileInput');
const segmentationVolumeDataFileInput = document.getElementById('segmentationVolumeDataFileInput');

const scannerVolumeExportLink = document.getElementById('scannerVolumeExportLink');
const segmentationVolumeExportLink = document.getElementById('segmentationVolumeExportLink');

const loaderOverlay = document.getElementById('loaderOverlay');
const loaderMessage = document.getElementById('loaderMessage');

const canvas = document.getElementById('canvas');
const view3DCover = document.getElementById('view3DCover');
const axisXCanvasLabel = document.getElementById('axisXLabel');
const axisYCanvasLabel = document.getElementById('axisYLabel');
const axisZCanvasLabel = document.getElementById('axisZLabel');
const view3DCanvasLabel = document.getElementById('view3DLabel');

const nrrdReader = new NRRDReader();
const fileReader = new FileReader();

const ipAddress = 'localhost';
const port = '3000';


let gui,

    scannerVolumeInfoFileNameController,
    selectScannerVolumeInfoFileController,
    scannerVolumeDataFileNameController,
    selectScannerVolumeDataFileController,

    serverScannerVolumeNameController,

    segmentationVolumeInfoFileNameController,
    selectSegmentationVolumeInfoFileController,
    segmentationVolumeDataFileNameController,
    selectSegmentationVolumeDataFileController,

    serverSegmentationVolumeNameController,

    serverScannerVolumes,
    serverSegmentationVolumes,

    serverScannerVolumeNames,
    serverSegmentationVolumeNames,

    scannerVolume,
    scannerVolumeEntry,
    scannerVolumeDenormalizedData,
    scannerVolumeNormalizedData,

    segmentationVolume,
    segmentationVolumeEntry,
    segmentationVolumeLabelData,

    newProjectGUI,
    deleteGUI,

    saveScannerVolumeNameController,
    saveSegmentationVolumeNameController,

    deleteScannerVolumeNameController,
    deleteSegmentationVolumeNameController
;


let renderer,

    textureWidth,
    textureHeight,
    textureDepth,

    scannerVolumeTexture,
    segmentationVolumeTexture,

    quad2DX,
    quad2DY,
    quad2DZ,
    quad2D3D,
    verticalLine2D,
    horizontalLine2D,
    camera2D,
    light2D,
    scene2D,

    quad3DX,
    quad3DY,
    quad3DZ,
    axisXLine3D,
    axisYLine3D,
    axisZLine3D,

    cubeLineV0V13D,
    cubeLineV1V23D,
    cubeLineV2V33D,
    cubeLineV3V03D,

    cubeLineV4V53D,
    cubeLineV5V63D,
    cubeLineV6V73D,
    cubeLineV7V43D,

    cubeLineV0V43D,
    cubeLineV1V53D,
    cubeLineV2V63D,
    cubeLineV3V73D,

    camera3D,
    cameraManager,
    light3D,
    lightDir3D,
    scene3D,

    renderQueue,
    renderPass3DViewport,
    renderPass2DViewport,

    sliceIndexXController,
    sliceIndexYController,
    sliceIndexZController,

    verticesTranslation3DX,
    verticesTranslation3DY,
    verticesTranslation3DZ,

    uvwTranslation3DX,
    uvwTranslation3DY,
    uvwTranslation3DZ,

    uvwTranslation2DX,
    uvwTranslation2DY,
    uvwTranslation2DZ,

    uvwScale2DX,
    uvwScale2DY,
    uvwScale2DZ,

    canvasMouseMoveX,
    canvasMouseMoveY,
    mouseOnCanvas,

    defaultSegmentLabel,
    defaultSegmentRGBValues,
    eraserRGBValues,
    paintRGBValues,
    paintStrokeSize,
    marchingCubesWorker,
    painting,

    segmentNameController,

    keyMap,
    keyboard,
    mouse
;


const guiData = {

    scannerVolumeInfoFileName: '',
    selectScannerVolumeInfoFile: function () {
        scannerVolumeInfoFileInput.click();
    },
    scannerVolumeDataFileName: '',
    selectScannerVolumeDataFile: function () {
        scannerVolumeDataFileInput.click();
    },
    serverScannerVolumeName: '',


    segmentationVolumeInfoFileName: '',
    selectSegmentationVolumeInfoFile: function () {
        segmentationVolumeInfoFileInput.click();
    },
    segmentationVolumeDataFileName: '',
    selectSegmentationVolumeDataFile: function () {
        segmentationVolumeDataFileInput.click();
    },
    serverSegmentationVolumeName: '',


    openNewProject: function () {
        openNewProject();
    },

    
    exportScannerVolume: function () {
        exportScannerVolumeToFiles();
    },

    exportSegmentationVolume: function () {
        exportSegmentationVolumeToFiles();
    },
    
    saveScannerVolumeName: '',
    saveScannerVolume: function () {
        loading('Saving scanner volume...', () => saveScannerVolumeToServer());
    },

    saveSegmentationVolumeName: '',
    saveSegmentationVolume: function () {
        loading('Saving segmentation volume...', () => saveSegmentationVolumeToServer());
    },

    deleteScannerVolumeName: '',
    deleteScannerVolume: function () {
        deleteScannerVolumeFromServer();
    },

    deleteSegmentationVolumeName: '',
    deleteSegmentationVolume: function () {
        deleteSegmentationVolumeFromServer();
    },


    sliceIndexX: 0,
    sliceIndexY: 0,
    sliceIndexZ: 0,

    camera3DRotationX: 0,
    camera3DRotationY: 0,
    camera3DTranslationZ: 2,

    scannerVolumeInvert: false,
    scannerVolumeBrightness: 0,
    scannerVolumeContrast: 0,
    scannerVolumeSobelOperator: false,
    scannerVolumeMinThreshold: 0,
    scannerVolumeMaxThreshold: 1.0,
    scannerVolumeThreshold: false,

    scannerVolumeOpacity: 1.0,

    segmentationVolumeOpacity: 1.0,

    segmentNames: [],

    segmentName: '',
    brushSize: 1,
    brushActive: false,
    eraserSize: 1,
    eraserActive: false,
    recolorRGBValues: [0, 0, 0],
    recolor: function () {
    },

    showSelectedSegmentMesh: function () {
    },
    showAllSegmentMeshes: function () {
    },
    hideSelectedSegmentMesh: function () {
    },
    hideAllSegmentMeshes: function () {
    },

    axes: ['x', 'y', 'z'],
    autoSegmentationAxis: 'x',
    autoSegmentationStartSliceIndex: 0,
    autoSegmentationEndSliceIndex: 0,
    autoSegmentation: function () {
    },

    addSegmentName: '',
    addSegmentRGBValues: [0, 0, 0],
    addSegment: function () {
    },
    removeSegmentName: '',
    removeSegment: function () {
    },
};


let segmentNameSegmentDict,
    segmentNameSegmentMeshDict,
    segmentNameSegmentRGBValuesDict,
    segmentNameSegmentBinaryDataDict,
    segmentationVolumeTextureData,
    scannerVolumeTextureData,
    segmentLabelSegmentDict,
    segmentLabels,
    volumeSize;


const paintStrokeSvgCursorParams = {
    width: 3,
    height: 3,
    cx: 1.5,
    cy: 1.5,
    strokeWidth: 1,
    rx: 2,
    ry: 2
};


window.addEventListener('load', () => {
    gui = new dat.GUI({width: 350});

    scannerVolumeEntry = 'new';
    segmentationVolumeEntry = 'new';

    getDataFromServer();
});


window.addEventListener('resize', () => {
    resize();
}, false);


function getDataFromServer() {
    getScannerVolumesFromServer(() => {
        getSegmentationVolumesFromServer(() => {
            initNewProjectControls();
            initDeleteControls();
        });
    });
}


function makeXMLHttpRequest(meta, responseCallback) {
    let request = new XMLHttpRequest();
    request.open(meta.openMethod, meta.openUrl, true);
    request.addEventListener('load', function () {
        if (this.status === 200) {
            responseCallback(this.response);
        }
    }, false);
    request.setRequestHeader(meta.headerName, meta.headerValue);
    request.responseType = meta.responseType;
    request.send(meta.sendBody);
}


function getScannerVolumesFromServer(callback) {
    const requestMeta = new XMLHttpRequestMeta(
        'GET',
        'http://' + ipAddress + ':' + port + '/scannervolume'
    );
    const requestResponseCallback = (response) => {
        serverScannerVolumes = response.data.scannerVolumes;
        serverScannerVolumeNames = serverScannerVolumes.map(volume => volume.name);
        callback();
    };
    makeXMLHttpRequest(requestMeta, requestResponseCallback);
}


function getSegmentationVolumesFromServer(callback) {
    const requestMeta = new XMLHttpRequestMeta(
        'GET',
        'http://' + ipAddress + ':' + port + '/segmentationvolume'
    );
    const requestResponseCallback = (response) => {
        serverSegmentationVolumes = response.data.segmentationVolumes;
        serverSegmentationVolumeNames = serverSegmentationVolumes.map(volume => volume.name);
        callback();
    };
    makeXMLHttpRequest(requestMeta, requestResponseCallback);
}


function initNewProjectControls() {
    newProjectGUI = gui.addFolder('New project');

    initNewProjectScannerVolumeControls(newProjectGUI);
    initNewProjectSegmentationVolumeControls(newProjectGUI);
    const openNewProjectController = newProjectGUI.add(guiData, 'openNewProject').name('Open');
}


function initNewProjectScannerVolumeControls(newProjectGUI) {
    const scannerVolumeGUI = newProjectGUI.addFolder('Scanner volume');

    // File
    const scannerVolumeFileGUI = scannerVolumeGUI.addFolder('File');

    //// Info
    const scannerVolumeInfoFileGUI = scannerVolumeFileGUI.addFolder('Info');
    scannerVolumeInfoFileNameController = scannerVolumeInfoFileGUI.add(guiData, 'scannerVolumeInfoFileName').name('Name');
    scannerVolumeInfoFileNameController.domElement.getElementsByTagName('input')[0].setAttribute('disabled', true);
    selectScannerVolumeInfoFileController = scannerVolumeInfoFileGUI.add(guiData, 'selectScannerVolumeInfoFile').name('Select file');
    scannerVolumeInfoFileInput.addEventListener('change', event => {
        const scannerVolumeInfoFile = event.target['files'][0];
        if (!scannerVolumeInfoFile) {
            return;
        }

        fileReader.onload = function () {
            const data = JSON.parse(fileReader.result);

            let invalidFile = false;

            if (!data.name) {
                console.error("Scanner volume info file must have name");
                invalidFile = true;
            } else if (!data.width) {
                console.error("Scanner volume info file must have width");
                invalidFile = true;
            } else if (!data.height) {
                console.error("Scanner volume info file must have height");
                invalidFile = true;
            } else if (!data.depth) {
                console.error("Scanner volume info file must have depth");
                invalidFile = true;
            }

            scannerVolumeInfoFileNameController.setValue('');
            scannerVolumeInfoFileInput.value = '';
            serverScannerVolumeNameController.setValue('');

            if (invalidFile) {
                scannerVolume = null;
                scannerVolumeEntry = 'new';
                return;
            }

            scannerVolume = new ScannerVolume(
                data.name,
                data.width,
                data.height,
                data.depth
            );
            scannerVolumeEntry = 'file';
            const scannerVolumeInfoFileName = scannerVolumeInfoFile.name.split('.')[0];
            scannerVolumeInfoFileNameController.setValue(scannerVolumeInfoFileName);
        };
        fileReader.readAsText(scannerVolumeInfoFile);
    });

    //// Data
    const scannerVolumeDataFileGUI = scannerVolumeFileGUI.addFolder('Data');
    scannerVolumeDataFileNameController = scannerVolumeDataFileGUI.add(guiData, 'scannerVolumeDataFileName').name('Name');
    scannerVolumeDataFileNameController.domElement.getElementsByTagName('input')[0].setAttribute('disabled', true);
    selectScannerVolumeDataFileController = scannerVolumeDataFileGUI.add(guiData, 'selectScannerVolumeDataFile').name('Select file');
    scannerVolumeDataFileInput.addEventListener('change', event => {
        const scannerVolumeDataFile = event.target['files'][0];
        if (!scannerVolumeDataFile) {
            return;
        }

        fileReader.onload = function () {
            let denormalizedData;
            if (scannerVolumeDataFile.name.split('.').pop() === 'nrrd') {
                const nrrdData = nrrdReader.parse(fileReader.result);
                denormalizedData = new Uint8Array(nrrdData.data);
            } else {
                denormalizedData = new Uint8Array(fileReader.result);
            }

            let invalidFile = false;

            if (!scannerVolume) {
                console.error("Scanner volume info file must be imported first");
                invalidFile = true;
            }

            if (denormalizedData.length !== (scannerVolume.width * scannerVolume.height * scannerVolume.depth)) {
                console.error("Scanner volume data file does not match parameters in info file");
                invalidFile = true;
            }

            scannerVolumeDataFileNameController.setValue('');
            scannerVolumeDataFileInput.value = '';
            serverScannerVolumeNameController.setValue('');

            if (invalidFile) {
                scannerVolumeDenormalizedData = null;
                scannerVolumeNormalizedData = null;
                scannerVolumeEntry = 'new';
                return;
            }

            const normalizedData = new Float32Array(denormalizedData.length);
            for (let i = 0; i < denormalizedData.length; i++) {
                normalizedData[i] = denormalizedData[i] / 256;
            }

            scannerVolumeDenormalizedData = denormalizedData;
            scannerVolumeNormalizedData = normalizedData;
            scannerVolumeEntry = 'file';

            const scannerVolumeDataFileName = scannerVolumeDataFile.name.split('.')[0];
            scannerVolumeDataFileNameController.setValue(scannerVolumeDataFileName);
        };
        fileReader.readAsArrayBuffer(scannerVolumeDataFile);
    });

    // Server
    const serverScannerVolumeGUI = scannerVolumeGUI.addFolder('Server');
    serverScannerVolumeNameController = serverScannerVolumeGUI.add(guiData, 'serverScannerVolumeName', serverScannerVolumeNames).name('Name');
    serverScannerVolumeNameController.onChange(v => {
        const selectedServerScannerVolume = serverScannerVolumes.find(volume => volume.name === v);
        if (!!selectedServerScannerVolume) {
            scannerVolume = new ScannerVolume(
                selectedServerScannerVolume.name,
                selectedServerScannerVolume.width,
                selectedServerScannerVolume.height,
                selectedServerScannerVolume.depth
            );

            scannerVolumeDenormalizedData = null;
            scannerVolumeNormalizedData = null;
            scannerVolumeEntry = 'server';
            scannerVolumeInfoFileNameController.setValue('');
            scannerVolumeDataFileNameController.setValue('');
        }
    });
}


function initNewProjectSegmentationVolumeControls(newProjectGUI) {
    const segmentationVolumeGUI = newProjectGUI.addFolder('Segmentation volume');

    // File
    const segmentationVolumeFileGUI = segmentationVolumeGUI.addFolder('File');

    //// Info
    const segmentationVolumeInfoFileGUI = segmentationVolumeFileGUI.addFolder('Info');
    segmentationVolumeInfoFileNameController = segmentationVolumeInfoFileGUI.add(guiData, 'segmentationVolumeInfoFileName').name('Name');
    segmentationVolumeInfoFileNameController.domElement.getElementsByTagName('input')[0].setAttribute('disabled', true);
    selectSegmentationVolumeInfoFileController = segmentationVolumeInfoFileGUI.add(guiData, 'selectSegmentationVolumeInfoFile').name('Select file');
    segmentationVolumeInfoFileInput.addEventListener('change', event => {
        const segmentationVolumeInfoFile = event.target['files'][0];
        if (!segmentationVolumeInfoFile) {
            return;
        }

        fileReader.onload = function () {
            const data = JSON.parse(fileReader.result);

            let invalidFile = false;

            if (!data.name) {
                console.error("Segmentation volume info file must have name");
                invalidFile = true;
            } else if (!data.width) {
                console.error("Segmentation volume info file must have width");
                invalidFile = true;
            } else if (!data.height) {
                console.error("Segmentation volume info file must have height");
                invalidFile = true;
            } else if (!data.depth) {
                console.error("Segmentation volume info file must have depth");
                invalidFile = true;
            } else if (!!data.segments) {
                let names = [];
                let labels = [];
                let rgbValues = [];

                for (let i=0; i<data.segments.length; i++) {
                    const segment = data.segments[i];
                    if (!segment.name) {
                        console.error("Every segment in segmentation volume info file must have name");
                        invalidFile = true;
                    } else if (!segment.label || segment.label === 0) {
                        console.error("Every segment in segmentation volume info file must have label and different than 0");
                        invalidFile = true;
                    } else if (!segment.rgbValues) {
                        console.error("Every segment in segmentation volume info file must have rgbValues");
                        invalidFile = true;
                    } else if (!!names.find(name => name === segment.name)) {
                        console.error("Every segment in segmentation volume info file must have unique name");
                        invalidFile = true;
                    } else if (!!labels.find(label => label === segment.label)) {
                        console.error("Every segment in segmentation volume info file must have unique label");
                        invalidFile = true;
                    } else if (!!rgbValues.find(values => values[0] === segment.rgbValues[0] && values[1] === segment.rgbValues[1] && values[2] === segment.rgbValues[2])) {
                        console.error("Every segment in segmentation volume info file must have unique rgb values");
                        invalidFile = true;
                    }

                    if (invalidFile) {
                        segmentationVolumeInfoFileInput.value = '';
                        return;
                    }

                    names.push(segment.name);
                    labels.push(segment.label);
                    rgbValues.push(segment.rgbValues);
                }
            }

            segmentationVolumeInfoFileNameController.setValue('');
            segmentationVolumeInfoFileInput.value = '';
            serverSegmentationVolumeNameController.setValue('');

            if (invalidFile) {
                segmentationVolume = null;
                segmentationVolumeEntry = 'new';
                return;
            }

            segmentationVolume = new SegmentationVolume(
                data.name,
                data.width,
                data.height,
                data.depth,
                data.segments
            );
            segmentationVolumeEntry = 'file';

            const segmentationVolumeInfoFileName = segmentationVolumeInfoFile.name.split('.')[0];
            segmentationVolumeInfoFileNameController.setValue(segmentationVolumeInfoFileName);
        };
        fileReader.readAsText(segmentationVolumeInfoFile);
    });

    //// Data
    const segmentationVolumeDataFileGUI = segmentationVolumeFileGUI.addFolder('Data');
    segmentationVolumeDataFileNameController = segmentationVolumeDataFileGUI.add(guiData, 'segmentationVolumeDataFileName').name('Name');
    segmentationVolumeDataFileNameController.domElement.getElementsByTagName('input')[0].setAttribute('disabled', true);
    selectSegmentationVolumeDataFileController = segmentationVolumeDataFileGUI.add(guiData, 'selectSegmentationVolumeDataFile').name('Select file');
    segmentationVolumeDataFileInput.addEventListener('change', event => {
        const segmentationVolumeDataFile = event.target['files'][0];
        if (!segmentationVolumeDataFile) {
            return;
        }

        fileReader.onload = function () {
            const labelData = new Uint16Array(fileReader.result);

            let invalidFile = false;

            if (!segmentationVolume) {
                console.error("Segmentation volume info file must be imported first");
                invalidFile = true;
            }

            if (labelData.length !== (segmentationVolume.width * segmentationVolume.height * segmentationVolume.depth)) {
                console.error("Segmentation volume data file does not match parameters in info file");
                invalidFile = true;
            }

            segmentationVolumeDataFileNameController.setValue('');
            segmentationVolumeDataFileInput.value = '';
            serverSegmentationVolumeNameController.setValue('');

            if (invalidFile) {
                segmentationVolumeLabelData = null;
                scannerVolumeEntry = 'new';
                return;
            }

            segmentationVolumeLabelData = labelData;
            segmentationVolumeEntry = 'file';

            const segmentationVolumeDataFileName = segmentationVolumeDataFile.name.split('.')[0];
            segmentationVolumeDataFileNameController.setValue(segmentationVolumeDataFileName);
        };
        fileReader.readAsArrayBuffer(segmentationVolumeDataFile);
    });

    // Server
    const serverSegmentationVolumeGUI = segmentationVolumeGUI.addFolder('Server');
    serverSegmentationVolumeNameController = serverSegmentationVolumeGUI.add(guiData, 'serverSegmentationVolumeName', serverSegmentationVolumeNames).name('Name');
    serverSegmentationVolumeNameController.onChange(v => {
        const selectedServerSegmentationVolume = serverSegmentationVolumes.find(volume => volume.name === v);
        if (!!selectedServerSegmentationVolume) {
            let segments = [];
            for (let i=0; i<selectedServerSegmentationVolume.segments.length; i++) {
                const serverSegment = selectedServerSegmentationVolume.segments[i];
                const segment = new Segment(
                    serverSegment.name,
                    serverSegment.label,
                    serverSegment.rgbValues
                );
                segments.push(segment);
            }

            segmentationVolume = new SegmentationVolume(
                selectedServerSegmentationVolume.name,
                selectedServerSegmentationVolume.width,
                selectedServerSegmentationVolume.height,
                selectedServerSegmentationVolume.depth,
                segments
            );

            segmentationVolumeLabelData = null;
            segmentationVolumeEntry = 'server';

            segmentationVolumeInfoFileNameController.setValue('');
            segmentationVolumeDataFileNameController.setValue('');
        }
    });
}


function initExportControls() {
    const exportGUI = gui.addFolder('Export');
    initExportScannerVolumeControls(exportGUI);
    initExportSegmentationVolumeControls(exportGUI);
}


function initExportScannerVolumeControls(exportGUI) {
    const exportScannerVolumeGUI = exportGUI.addFolder('Scanner volume');
    const exportScannerVolumeController = exportScannerVolumeGUI.add(guiData, 'exportScannerVolume').name('Export');
}


function initExportSegmentationVolumeControls(exportGUI) {
    const exportSegmentationVolumeGUI = exportGUI.addFolder('Segmentation volume');
    const exportSegmentationVolumeController = exportSegmentationVolumeGUI.add(guiData, 'exportSegmentationVolume').name('Export');
}


function initSaveControls() {
    const saveGUI = gui.addFolder('Save to server');
    initSaveScannerVolumeControls(saveGUI);
    initSaveSegmentationVolumeControls(saveGUI);
}


function initSaveScannerVolumeControls(saveGUI) {
    const scannerGUI = saveGUI.addFolder('Scanner volume');
    saveScannerVolumeNameController = scannerGUI.add(guiData, 'saveScannerVolumeName').name('Name');
    const saveScannerVolumeController = scannerGUI.add(guiData, 'saveScannerVolume').name('Save');
}


function initSaveSegmentationVolumeControls(saveGUI) {
    const segmentationGUI = saveGUI.addFolder('Segmentation volume');
    saveSegmentationVolumeNameController = segmentationGUI.add(guiData, 'saveSegmentationVolumeName').name('Name');
    const saveSegmentationVolumeController = segmentationGUI.add(guiData, 'saveSegmentationVolume').name('Save');
}


function initDeleteControls() {
    deleteGUI = gui.addFolder('Delete');
    initDeleteScannerVolumeControls(deleteGUI);
    initDeleteSegmentationVolumeControls(deleteGUI);
}


function initDeleteScannerVolumeControls(deleteGUI) {
    const scannerGUI = deleteGUI.addFolder('Scanner volume');
    deleteScannerVolumeNameController = scannerGUI.add(guiData, 'deleteScannerVolumeName', serverScannerVolumeNames).name('Name');
    const deleteScannerVolumeController = scannerGUI.add(guiData, 'deleteScannerVolume').name('Delete');
}


function initDeleteSegmentationVolumeControls(deleteGUI) {
    const segmentationGUI = deleteGUI.addFolder('Segmentation volume');
    deleteSegmentationVolumeNameController = segmentationGUI.add(guiData, 'deleteSegmentationVolumeName', serverSegmentationVolumeNames).name('Name');
    const deleteSegmentationVolumeController = segmentationGUI.add(guiData, 'deleteSegmentationVolume').name('Delete');
}


function exportScannerVolumeToFiles() {
    // info file
    const scannerVolumeInfo = JSON.stringify(scannerVolume, null, "\t");
    const scannerVolumeInfoBlob = new Blob([scannerVolumeInfo], {type: "application/json"});
    scannerVolumeExportLink.download = 'scanner-volume-info';
    scannerVolumeExportLink.href = window.URL.createObjectURL(scannerVolumeInfoBlob);
    scannerVolumeExportLink.click();

    // data file
    const scannerVolumeData = scannerVolumeDenormalizedData;
    const scannerVolumeDataBlob = new Blob([scannerVolumeData], {type: "application/octet-stream"});
    scannerVolumeExportLink.download = 'scanner-volume-data';
    scannerVolumeExportLink.href = window.URL.createObjectURL(scannerVolumeDataBlob);
    scannerVolumeExportLink.click();
}


function exportSegmentationVolumeToFiles() {
    // info file
    const segmentationVolumeInfo = JSON.stringify(segmentationVolume, null, "\t");
    const segmentationVolumeInfoBlob = new Blob([segmentationVolumeInfo], {type: "application/json"});
    segmentationVolumeExportLink.download = 'segmentation-volume-info';
    segmentationVolumeExportLink.href = window.URL.createObjectURL(segmentationVolumeInfoBlob);
    segmentationVolumeExportLink.click();

    // data file
    const segmentationVolumeData = segmentationVolumeLabelData;
    const segmentationVolumeDataBlob = new Blob([segmentationVolumeData], {type: "application/octet-stream"});
    segmentationVolumeExportLink.download = 'segmentation-volume-data';
    segmentationVolumeExportLink.href = window.URL.createObjectURL(segmentationVolumeDataBlob);
    segmentationVolumeExportLink.click();
}


function saveScannerVolumeToServer() {
    if (!guiData.saveScannerVolumeName) {
        alert('Scanner volume name is required');
        return;
    }

    const serverScannerVolume = new ServerScannerVolume(
        guiData.saveScannerVolumeName,
        scannerVolume.width,
        scannerVolume.height,
        scannerVolume.depth,
        guiData.saveScannerVolumeName
    );

    const scannerVolumeRequestMeta =  new XMLHttpRequestMeta(
        'POST',
        'http://' + ipAddress + ':' + port + '/scannervolume',
        JSON.stringify(serverScannerVolume)
    );

    const scannerVolumeDataRequestMeta =  new XMLHttpRequestMeta(
        'POST',
        'http://' + ipAddress + ':' + port + '/scannervolumedata/' + serverScannerVolume.name,
        scannerVolumeDenormalizedData,
        'json',
        'Content-Type',
        'application/octet-stream'
    );

    const scannerVolumeDataRequestResponseCallback = (response) => {
        console.log(response.status);

        alert('Succeeded to save scanner volume');

        const deleteScannerVolumeNameSelectElement = deleteScannerVolumeNameController.domElement.getElementsByTagName('select')[0];
        const deleteScannerVolumeNameOptionElement = document.createElement('option');
        deleteScannerVolumeNameOptionElement.text = serverScannerVolume.name;
        deleteScannerVolumeNameSelectElement.add(deleteScannerVolumeNameOptionElement);

        serverScannerVolumes.push(serverScannerVolume);
        serverScannerVolumeNames.push(serverScannerVolume.name);

        saveScannerVolumeNameController.setValue('');
        if (serverScannerVolumeNames.length === 1) {
            deleteScannerVolumeNameController.setValue(serverScannerVolume.name);
        }
    };

    const scannerVolumeRequestResponseCallback = (response) => {
        console.log(response.status);
        makeXMLHttpRequest(scannerVolumeDataRequestMeta, scannerVolumeDataRequestResponseCallback);
    };

    makeXMLHttpRequest(scannerVolumeRequestMeta, scannerVolumeRequestResponseCallback);
}


function saveSegmentationVolumeToServer() {
    if (!guiData.saveSegmentationVolumeName) {
        alert('Segmentation volume name is required');
        return;
    }

    const serverSegments = [];
    for (let i = 0; i < guiData.segmentNames.length; i++) {
        const segment = segmentNameSegmentDict[guiData.segmentNames[i]];
        const serverSegment = new ServerSegment(
            segment.name,
            segment.label,
            segment.rgbValues
        );
        serverSegments.push(serverSegment);
    }

    const serverSegmentationVolume = new ServerSegmentationVolume(
        guiData.saveSegmentationVolumeName,
        segmentationVolume.width,
        segmentationVolume.height,
        segmentationVolume.depth,
        serverSegments,
        guiData.saveSegmentationVolumeName
    );


    const segmentationVolumeRequestMeta = new XMLHttpRequestMeta(
        'POST',
        'http://' + ipAddress + ':' + port + '/segmentationvolume',
        JSON.stringify(serverSegmentationVolume)
    );


    const segmentationVolumeDataRequestMeta =  new XMLHttpRequestMeta(
        'POST',
        'http://' + ipAddress + ':' + port + '/segmentationvolumedata/' + serverSegmentationVolume.name,
        segmentationVolumeLabelData,
        'json',
        'Content-Type',
        'application/octet-stream'
    );

    const segmentationVolumeDataRequestResponseCallback = (response) => {
        console.log(response.status);

        alert('Succeeded to save segmentation volume');

        const deleteSegmentationVolumeNameSelectElement = deleteSegmentationVolumeNameController.domElement.getElementsByTagName('select')[0];
        const deleteSegmentationVolumeNameOptionElement = document.createElement('option');
        deleteSegmentationVolumeNameOptionElement.text = serverSegmentationVolume.name;
        deleteSegmentationVolumeNameSelectElement.add(deleteSegmentationVolumeNameOptionElement);

        serverSegmentationVolumes.push(serverSegmentationVolume);
        serverSegmentationVolumeNames.push(serverSegmentationVolume.name);

        saveSegmentationVolumeNameController.setValue('');
        if (serverSegmentationVolumeNames.length === 1) {
            deleteSegmentationVolumeNameController.setValue(serverSegmentationVolume.name);
        }
    };

    const segmentationVolumeRequestResponseCallback = (response) => {
        console.log(response.status);
        makeXMLHttpRequest(segmentationVolumeDataRequestMeta, segmentationVolumeDataRequestResponseCallback);
    };
    makeXMLHttpRequest(segmentationVolumeRequestMeta, segmentationVolumeRequestResponseCallback);
}


function deleteScannerVolumeFromServer() {
    if (!guiData.deleteScannerVolumeName) {
        alert('Scanner volume name is required');
        return;
    }

    const serverScannerVolumeName = guiData.deleteScannerVolumeName;

    const scannerVolumeRequestMeta = new XMLHttpRequestMeta(
        'DELETE',
        'http://' + ipAddress + ':' + port + '/scannervolume/' + serverScannerVolumeName,
    );

    const scannerVolumeDataRequestMeta =  new XMLHttpRequestMeta(
        'DELETE',
        'http://' + ipAddress + ':' + port + '/scannervolumedata/' + serverScannerVolumeName
    );

    const scannerVolumeRequestResponseCallback = (response) => {
        console.log(response.status);

        alert('Succeeded to delete scanner volume');

        const deleteScannerVolumeNameSelectElement = deleteScannerVolumeNameController.domElement.getElementsByTagName('select')[0];
        const index = serverScannerVolumeNames.findIndex(name => name === serverScannerVolumeName);
        deleteScannerVolumeNameSelectElement.remove(index);
        serverScannerVolumes.splice(index, 1);
        serverScannerVolumeNames.splice(index, 1);

        deleteScannerVolumeNameController.setValue('');

        location.reload();
    };

    const scannerVolumeDataRequestResponseCallback = (response) => {
        console.log(response.status);
        makeXMLHttpRequest(scannerVolumeRequestMeta, scannerVolumeRequestResponseCallback);
    };

    makeXMLHttpRequest(scannerVolumeDataRequestMeta, scannerVolumeDataRequestResponseCallback);
}


function deleteSegmentationVolumeFromServer() {
    if (!guiData.deleteSegmentationVolumeName) {
        alert('Segmentation volume name is required');
        return;
    }

    const serverSegmentationVolumeName = guiData.deleteSegmentationVolumeName;

    const segmentationVolumeRequestMeta = new XMLHttpRequestMeta(
        'DELETE',
        'http://' + ipAddress + ':' + port + '/segmentationvolume/' + serverSegmentationVolumeName,
    );

    const segmentationVolumeDataRequestMeta = new XMLHttpRequestMeta(
        'DELETE',
        'http://' + ipAddress + ':' + port + '/segmentationvolumedata/' + serverSegmentationVolumeName,
    );

    const segmentationVolumeResponseCallback = (response) => {
        console.log(response.status);

        alert('Succeeded to delete segmentation volume');

        const deleteSegmentationVolumeNameSelectElement = deleteSegmentationVolumeNameController.domElement.getElementsByTagName('select')[0];
        const index = serverSegmentationVolumeNames.findIndex(name => name === serverSegmentationVolumeName);
        deleteSegmentationVolumeNameSelectElement.remove(index);
        serverSegmentationVolumes.splice(index, 1);
        serverSegmentationVolumeNames.splice(index, 1);

        deleteSegmentationVolumeNameController.setValue('');

        location.reload();
    };

    const segmentationVolumeDataRequestResponseCallback = (response) => {
        console.log(response.status);
        makeXMLHttpRequest(segmentationVolumeRequestMeta, segmentationVolumeResponseCallback);
    };

    makeXMLHttpRequest(segmentationVolumeDataRequestMeta, segmentationVolumeDataRequestResponseCallback);
}


function validateNewProject() {
    if (!scannerVolume) {
        alert('Scanner volume is required');
        return false;
    }
    if (segmentationVolume) {
        if (segmentationVolume.width !== scannerVolume.width) {
            alert('Scanner volume and segmentation volume width do not match');
            return false;
        }
        if (segmentationVolume.height !== scannerVolume.height) {
            alert('Scanner volume and segmentation volume height do not match');
            return false;
        }
        if (segmentationVolume.depth !== scannerVolume.depth) {
            alert('Scanner volume and segmentation volume depth do not match');
            return false;
        }
    }
    return true;
}


function openNewProject() {
    if (segmentationVolumeEntry === 'new') {
        segmentationVolume = new SegmentationVolume(
            'new',
            scannerVolume.width,
            scannerVolume.height,
            scannerVolume.depth,
            []
        );
        segmentationVolumeLabelData = new Uint16Array(scannerVolume.width * scannerVolume.height * scannerVolume.depth);
    }

    if (!validateNewProject()) {
        return;
    }

    if (scannerVolumeEntry === 'server'){
        getScannerVolumeDataFromServer(() => {
            if (segmentationVolumeEntry === 'server') {
                getSegmentationDataFromServer( () =>{
                    init();
                });
            } else {
                init();
            }
        });
    } else if (segmentationVolumeEntry === 'server') {
        getSegmentationDataFromServer( () =>{
            init();
        });
    } else {
        init();
    }
}


function getScannerVolumeDataFromServer(callback) {
    const requestMeta =  new XMLHttpRequestMeta(
        'GET',
        'http://' + ipAddress + ':' + port + '/scannervolumedata/' + scannerVolume.name,
        null,
        'arraybuffer',
        'Content-Type',
        'application/octet-stream'
    );

    const requestResponseCallback = (response) => {
        scannerVolumeDenormalizedData = new Uint8Array(response);
        scannerVolumeNormalizedData = new Float32Array(scannerVolume.width * scannerVolume.height * scannerVolume.depth);
        for (let i=0; i<scannerVolumeDenormalizedData.length; i++) {
            scannerVolumeNormalizedData[i] = scannerVolumeDenormalizedData[i] / 255;
        }
        callback();
    };
    makeXMLHttpRequest(requestMeta, requestResponseCallback);
}


function getSegmentationDataFromServer(callback) {
    const requestMeta =  new XMLHttpRequestMeta(
        'GET',
        'http://' + ipAddress + ':' + port + '/segmentationvolumedata/' + segmentationVolume.name,
        null,
        'arraybuffer',
        'Content-Type',
        'application/octet-stream'
    );

    const requestResponseCallback = (response) => {
        segmentationVolumeLabelData = new Uint16Array(response);
        callback();
    };
    makeXMLHttpRequest(requestMeta, requestResponseCallback);
}


function init() {
    console.log('Scanner volume', scannerVolume);
    console.log('Segmentation volume', segmentationVolume);

    gui.removeFolder(newProjectGUI);
    gui.removeFolder(deleteGUI);

    // canvas
    const minSize = Math.min(window.innerWidth, window.innerHeight);

    canvas.width = minSize;
    canvas.height = minSize;

    renderPass3DViewport = {
        width: minSize,
        height: minSize
    };

    renderPass2DViewport = {
        width: minSize,
        height: minSize
    };

    // renderer
    renderer = new RC.MeshRenderer(canvas, RC.WEBGL2, {antialias: true});
    renderer.clearColor = '#9fbae1ff';
    renderer.addShaderLoaderUrls('./lib/rendercore/src/shaders');
    renderer.addShaderLoaderUrls('./lib/rendercore/examples/common/shaders');
    renderer.updateViewport(canvas.width, canvas.height);


    verticesTranslation3DX = [0.0, 0.0, 0.0];
    verticesTranslation3DY = [0.0, 0.0, 0.0];
    verticesTranslation3DZ = [0.0, 0.0, 0.0];

    uvwTranslation2DX = [0.0, 0.0, 0.0];
    uvwTranslation2DY = [0.0, 0.0, 0.0];
    uvwTranslation2DZ = [0.0, 0.0, 0.0];

    uvwScale2DX = [1.0, 1.0, 1.0];
    uvwScale2DY = [1.0, 1.0, 1.0];
    uvwScale2DZ = [1.0, 1.0, 1.0];

    uvwTranslation3DX = [0.0, 0.0, 0.0];
    uvwTranslation3DY = [0.0, 0.0, 0.0];
    uvwTranslation3DZ = [0.0, 0.0, 0.0];

    defaultSegmentLabel = 0;
    defaultSegmentRGBValues = [0.0, 0.0, 0.0];
    eraserRGBValues = [-1.0, -1.0, -1.0];
    paintRGBValues = defaultSegmentRGBValues;
    paintStrokeSize = 1;
    marchingCubesWorker = new MarchingCubesWorker();
    painting = false;

    textureWidth = scannerVolume.width;
    textureHeight = scannerVolume.height;
    textureDepth = scannerVolume.depth;
    volumeSize = textureWidth * textureHeight * textureDepth;

    segmentNameSegmentDict = {};
    segmentNameSegmentMeshDict = {};
    segmentNameSegmentRGBValuesDict = {};
    segmentNameSegmentBinaryDataDict = {};
    segmentLabelSegmentDict = {};
    segmentLabels = [];

    scannerVolumeTextureData = scannerVolumeNormalizedData;
    segmentationVolumeTextureData = new Float32Array(volumeSize * 3);

    keyMap = {
        ROT_X_NEG: 40,
        ROT_X_POS: 38,
        ROT_Y_NEG: 39,
        ROT_Y_POS: 37,
        //ROT_Z_NEG: 69,
        ROT_Z_NEG: undefined,
        //ROT_Z_POS: 81,
        ROT_Z_POS: undefined,

        MV_X_NEG: 65,
        MV_X_POS: 68,
        //MV_Y_NEG: 17,
        MV_Y_NEG: 81,
        //MV_Y_POS: 32,
        MV_Y_POS: 69,
        MV_Z_NEG: 87,
        MV_Z_POS: 83,
    };

    keyboard = {
        keyboardInput: RC.KeyboardInput.instance,
        keyboardTranslation: {x: 0, y: 0, z: 0},
        keyboardRotation: {x: 0, y: 0, z: 0}
    };

    mouse = {
        mouseInput: RC.MouseInput.instance
    };

    mouse.mouseInput.setSourceObject(view3DCover);

    segmentationVolume.segments.forEach(segment => {
        // Arrays
        guiData.segmentNames.push(segment.name);
        segmentLabels.push(segment.label);

        // Dictionaries
        segmentNameSegmentDict[segment.name] = segment;
        segmentNameSegmentRGBValuesDict[segment.name] = segment.rgbValues;
        segmentLabelSegmentDict[segment.label] = segment;
        segmentNameSegmentBinaryDataDict[segment.name] = new Uint8Array(volumeSize);
    });

    for (let i = 0; i < volumeSize; i++) {
        const segment = segmentLabelSegmentDict[segmentationVolumeLabelData[i]];
        if (segment) {
            segmentNameSegmentBinaryDataDict[segment.name][i] = 1;

            segmentationVolumeTextureData[i*3 + 0] = segment.rgbValues[0];
            segmentationVolumeTextureData[i*3 + 1] = segment.rgbValues[1];
            segmentationVolumeTextureData[i*3 + 2] = segment.rgbValues[2];
        }
    }

    scannerVolumeTexture = new RC.Texture3D(
        0,
        RC.Texture.R32F,
        textureWidth,
        textureHeight,
        textureDepth,
        0,
        RC.Texture.RED,
        RC.Texture.FLOAT,
        scannerVolumeTextureData
    );

    segmentationVolumeTexture = new RC.Texture3D(
        0,
        RC.Texture.RGB32F,
        textureWidth,
        textureHeight,
        textureDepth,
        0,
        RC.Texture.RGB,
        RC.Texture.FLOAT,
        segmentationVolumeTextureData
    );

    initView3DCover();
    initCanvasLabels();
    initScenes();

    initRenderQueue();
    initControls();
    initEventListeners();

    render()
}


function initView3DCover() {
    view3DCover.style.display = 'block';
    setView3DCoverSizeAndPosition();
}


function initCanvasLabels() {
    axisXCanvasLabel.style.display = 'block';
    axisYCanvasLabel.style.display = 'block';
    axisZCanvasLabel.style.display = 'block';
    view3DCanvasLabel.style.display = 'block';
    setCanvasLabelsPosition();
}


function initScenes() {
    initScene2D();
    initScene3D();
}


function initScene2D() {
    camera2D = new RC.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera2D.position = new RC.Vector3(0, 0, 1);

    light2D = new RC.AmbientLight(new RC.Color("#FFFFFF"), 1.0);

    initQuad2DX();
    initQuad2DY();
    initQuad2DZ();
    initVerticalLine2D();
    initHorizontalLine2D();
    initQuad2D3D();

    scene2D = new RC.Scene();
    scene2D.add(quad2DX);
    scene2D.add(quad2DY);
    scene2D.add(quad2DZ);
    scene2D.add(quad2D3D);
    scene2D.add(verticalLine2D);
    scene2D.add(horizontalLine2D);
    scene2D.add(light2D);
}


function initQuad2DX() {
    // /*
    // vertices
    //
    //       V0               V3
    //       (-1, 1, 0)       (0, 1, 0)
    //       X----------------X
    //       |                |
    //       |                |
    //       |                |
    //       |                |
    //       |                |
    //       X----------------X
    //       V1               V2
    //       (-1, 0, 0)       (0, 0, 0)
    //
    // textureCoords
    //
    //              X V3
    //             /| (0, 0, 0)
    //            / |
    //        V0 X  |
    // (0, 0, 1) |  |
    //           |  |
    //           |  X V2
    //           | /  (0, 1, 0)
    //           |/
    //           X
    //           V1
    //           (0, 1, 1)
    // */

    // geometry
    let geometry = new Geometry();
    geometry.vertices = Float32Attribute(
        [
            -1, 1, 0,
            -1, 0, 0,
            0, 0, 0,
            0, 1, 0
        ], 3
    );
    geometry.vertColor = Float32Attribute(
        [
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1
        ], 4
    );
    geometry.uvw = Float32Attribute(
        [
            0, 0, 1,
            0, 1, 1,
            0, 1, 0,
            0, 0, 0
        ], 3
    );
    geometry.indices = Uint32Attribute([0, 1, 2, 0, 2, 3], 1);
    geometry.computeVertexNormals();

    // material
    const customShaderMaterialUniforms = {
        "material.specular": new Color(Math.random() * 0xffffff),
        "material.shininess": Math.random() * 16,
        "uvwTranslation": uvwTranslation2DX,
        "uvwScale": uvwScale2DX,

        "uInvert": guiData.scannerVolumeInvert,
        "uBrightness": guiData.scannerVolumeBrightness,
        "uContrast": guiData.scannerVolumeContrast,
        "uSobelOperator": guiData.scannerVolumeSobelOperator,
        "uMinThreshold": guiData.scannerVolumeMinThreshold,
        "uMaxThreshold": guiData.scannerVolumeMaxThreshold,
        "uThreshold": guiData.scannerVolumeThreshold,
        "uScannerOpacity": guiData.scannerVolumeOpacity,
        "uSegmentationOpacity": guiData.segmentationVolumeOpacity
    };
    let material = new RC.CustomShaderMaterial("volumeViewer", customShaderMaterialUniforms);
    material.color = new RC.Color(1.0, 1.0, 1.0);
    material.addMap(scannerVolumeTexture);
    material.addMap(segmentationVolumeTexture);
    material.transparent = true;
    material.opacity = 1.0;

    // quad
    quad2DX = new RC.Quad(undefined, undefined, material, geometry, true);
}


function initQuad2DY() {
    // /*
    // vertices
    //
    //       V0               V3
    //       (-1, 0, 0)       (0, 0, 0)
    //       X----------------X
    //       |                |
    //       |                |
    //       |                |
    //       |                |
    //       |                |
    //       X----------------X
    //       V1               V2
    //       (-1, -1, 0)      (0, -1, 0)
    //
    // textureCoords
    //
    //              V0                V3
    //              (0, 1, 0)         (1, 1, 0)
    //              X-----------------X
    //             /                 /
    //            /                 /
    //           X-----------------X
    //           V1                V2
    //           (0, 1, 1)         (1, 1, 1)
    //*/


    // geometry
    let geometry = new Geometry();
    geometry.vertices = Float32Attribute(
        [
            -1, 0, 0,
            -1, -1, 0,
            0, -1, 0,
            0, 0, 0
        ], 3
    );
    geometry.vertColor = Float32Attribute(
        [
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1
        ], 4
    );
    geometry.uvw = Float32Attribute(
        [
            0, 1, 0,
            0, 1, 1,
            1, 1, 1,
            1, 1, 0
        ], 3
    );
    geometry.indices = Uint32Attribute([0, 1, 2, 0, 2, 3], 1);
    geometry.computeVertexNormals();

    // material
    const customShaderMaterialUniforms = {
        "material.specular": new Color(Math.random() * 0xffffff),
        "material.shininess": Math.random() * 16,
        "uvwTranslation": uvwTranslation2DY,
        "uvwScale": uvwScale2DY,

        "uInvert": guiData.scannerVolumeInvert,
        "uBrightness": guiData.scannerVolumeBrightness,
        "uContrast": guiData.scannerVolumeContrast,
        "uSobelOperator": guiData.scannerVolumeSobelOperator,
        "uMinThreshold": guiData.scannerVolumeMinThreshold,
        "uMaxThreshold": guiData.scannerVolumeMaxThreshold,
        "uThreshold": guiData.scannerVolumeThreshold,
        "uScannerOpacity": guiData.scannerVolumeOpacity,
        "uSegmentationOpacity": guiData.segmentationVolumeOpacity
    };
    let material = new RC.CustomShaderMaterial("volumeViewer", customShaderMaterialUniforms);
    material.color = new RC.Color(1.0, 1.0, 1.0);
    material.addMap(scannerVolumeTexture);
    material.addMap(segmentationVolumeTexture);
    material.transparent = true;
    material.opacity = 1.0;

    // quad
    quad2DY = new RC.Quad(undefined, undefined, material, geometry, true);
}


function initQuad2DZ() {
    // /*
    // vertices
    //
    //       V0               V3
    //       (0, 1, 0)        (1, 1, 0)
    //       X----------------X
    //       |                |
    //       |                |
    //       |                |
    //       |                |
    //       |                |
    //       X----------------X
    //       V1               V2
    //       (0, 0, 0)        (1, 0, 0)
    //
    // textureCoords
    //
    //       V0               V3
    //       (0, 0, 0)        (1, 0, 0)
    //       X----------------X
    //       |                |
    //       |                |
    //       |                |
    //       |                |
    //       |                |
    //       X----------------X
    //       V1               V2
    //       (0, 1, 0)        (1, 1, 0)
    // */


    // geometry
    let geometry = new Geometry();
    geometry.vertices = Float32Attribute(
        [
            0, 1, 0,
            0, 0, 0,
            1, 0, 0,
            1, 1, 0
        ], 3
    );
    geometry.vertColor = Float32Attribute(
        [
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1
        ], 4
    );
    geometry.uvw = Float32Attribute(
        [
            0, 0, 0,
            0, 1, 0,
            1, 1, 0,
            1, 0, 0
        ], 3
    );
    geometry.indices = Uint32Attribute([0, 1, 2, 0, 2, 3], 1);
    geometry.computeVertexNormals();

    // material
    const customShaderMaterialUniforms = {
        "material.specular": new Color(Math.random() * 0xffffff),
        "material.shininess": Math.random() * 16,
        "uvwTranslation": uvwTranslation2DZ,
        "uvwScale": uvwScale2DZ,

        "uInvert": guiData.scannerVolumeInvert,
        "uBrightness": guiData.scannerVolumeBrightness,
        "uContrast": guiData.scannerVolumeContrast,
        "uSobelOperator": guiData.scannerVolumeSobelOperator,
        "uMinThreshold": guiData.scannerVolumeMinThreshold,
        "uMaxThreshold": guiData.scannerVolumeMaxThreshold,
        "uThreshold": guiData.scannerVolumeThreshold,
        "uScannerOpacity": guiData.scannerVolumeOpacity,
        "uSegmentationOpacity": guiData.segmentationVolumeOpacity
    };
    let material = new RC.CustomShaderMaterial("volumeViewer", customShaderMaterialUniforms);
    material.color = new RC.Color(1.0, 1.0, 1.0);
    material.addMap(scannerVolumeTexture);
    material.addMap(segmentationVolumeTexture);
    material.transparent = true;
    material.opacity = 1.0;

    // quad
    quad2DZ = new RC.Quad(undefined, undefined, material, geometry, true);
}


function initQuad2D3D() {
    // /*
    // vertices
    //
    //       V0               V3
    //       (0, 0, 0)        (1, 0, 0)
    //       X----------------X
    //       |                |
    //       |                |
    //       |                |
    //       |                |
    //       |                |
    //       X----------------X
    //       V1               V2
    //       (0, -1, 0)       (1, -1, 0)
    //
    // textureCoords
    //
    //       V0               V3
    //       (0, 1)           (1, 1)
    //       X----------------X
    //       |                |
    //       |                |
    //       |                |
    //       |                |
    //       |                |
    //       X----------------X
    //       V1               V2
    //       (0, 0)          (1, 0)
    // */


    // geometry
    let geometry = new Geometry();
    geometry.vertices = Float32Attribute(
        [
            0, 0, 0,
            0, -1, 0,
            1, -1, 0,
            1, 0, 0
        ], 3
    );
    geometry.vertColor = Float32Attribute(
        [
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1
        ], 4
    );
    geometry.uv = Float32Attribute(
        [
            0, 1,
            0, 0,
            1, 0,
            1, 1
        ], 2
    );


    geometry.indices = Uint32Attribute([0, 1, 2, 0, 2, 3], 1);
    geometry.computeVertexNormals();

    // material
    let material = new RC.MeshPhongMaterial();
    material.color = new RC.Color(1.0, 1.0, 1.0);

    // quad
    quad2D3D = new RC.Quad(undefined, undefined, material, geometry, true);
}


function initVerticalLine2D() {
    // geometry
    let geometry = new Geometry();
    geometry.vertices = Float32Attribute(
        [
            0, 1, 0.1,
            0, -1, 0.1
        ], 3
    );

    // material
    let material = new RC.MeshBasicMaterial();
    material.color = new RC.Color(0.0, 0.0, 0.0);
    material.lights = false;

    // line
    verticalLine2D = new RC.Line(geometry, material);
    verticalLine2D.renderingPrimitive = RC.LINES;
}


function initHorizontalLine2D() {
    // geometry
    let geometry = new Geometry();
    geometry.vertices = Float32Attribute(
        [
            -1, 0, 0.1,
            1, 0, 0.1
        ], 3
    );

    // material
    let material = new RC.MeshBasicMaterial();
    material.color = new RC.Color(0.0, 0.0, 0.0);
    material.lights = false;

    // line
    horizontalLine2D = new RC.Line(geometry, material);
    horizontalLine2D.renderingPrimitive = RC.LINES;
}


function initScene3D() {
    camera3D = new RC.PerspectiveCamera(0, 1, 1, 1000);
    camera3D.position = new RC.Vector3(2.0, 2.0, 2.0);
    camera3D.lookAt(new RC.Vector3(0, 0, 0), new RC.Vector3(0, 1, 0));

    cameraManager = new RC.CameraManager();
    cameraManager.addFullOrbitCamera(camera3D, new RC.Vector3(0, 0, 0));
    cameraManager.camerasControls[camera3D._uuid].keyMap = keyMap;
    cameraManager.activeCamera = camera3D;

    light3D = new RC.AmbientLight(new RC.Color(0.1, 0.1, 0.1), 1.0);
    lightDir3D = new RC.DirectionalLight(new RC.Color(1.0, 1.0, 1.0), 1.0);
    lightDir3D.position = new RC.Vector3(2.0, 2.0, 2.0);
    lightDir3D.lookAt(new RC.Vector3(0.0, 0.0, 0.0), new RC.Vector3(0.0, 1.0, 0.0));

    initQuad3DX();
    initQuad3DY();
    initQuad3DZ();

    initAxisXLine3D();
    initAxisYLine3D();
    initAxisZLine3D();

    initCubeLines3D();

    scene3D = new RC.Scene();

    scene3D.add(quad3DX);
    scene3D.add(quad3DY);
    scene3D.add(quad3DZ);

    scene3D.add(axisXLine3D);
    scene3D.add(axisYLine3D);
    scene3D.add(axisZLine3D);

    scene3D.add(cubeLineV0V13D);
    scene3D.add(cubeLineV1V23D);
    scene3D.add(cubeLineV2V33D);
    scene3D.add(cubeLineV3V03D);

    scene3D.add(cubeLineV4V53D);
    scene3D.add(cubeLineV5V63D);
    scene3D.add(cubeLineV6V73D);
    scene3D.add(cubeLineV7V43D);

    scene3D.add(cubeLineV0V43D);
    scene3D.add(cubeLineV1V53D);
    scene3D.add(cubeLineV2V63D);
    scene3D.add(cubeLineV3V73D);

    scene3D.add(light3D);
    scene3D.add(lightDir3D);
}


function initQuad3DX() {
    // /*
    // vertices
    //
    //                     X V3
    //                    /| (-0.5, 0.5, -0.5)
    //                   / |
    //               V0 X  |
    // (-0.5, 0.5, 0.5) |  |
    //                  |  |
    //                  |  X V2
    //                  | /  (-0.5, -0.5, -0.5)
    //                  |/
    //                  X
    //                  V1
    //                  (-0.5, -0.5, 0.5)
    //
    // textureCoords
    //
    //              X V3
    //             /| (0, 0, 0)
    //            / |
    //        V0 X  |
    // (0, 0, 1) |  |
    //           |  |
    //           |  X V2
    //           | /  (0, 1, 0)
    //           |/
    //           X
    //           V1
    //           (0, 1, 1)
    // */

    // geometry
    let geometry = new Geometry();
    geometry.vertices = Float32Attribute(
        [
            -0.5, 0.5, 0.5,
            -0.5, -0.5, 0.5,
            -0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5
        ], 3
    );
    geometry.vertColor = Float32Attribute(
        [
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1
        ], 4
    );
    geometry.uvw = Float32Attribute(
        [
            0, 0, 1,
            0, 1, 1,
            0, 1, 0,
            0, 0, 0
        ], 3
    );
    geometry.indices = Uint32Attribute([0, 1, 2, 0, 2, 3], 1);
    geometry.computeVertexNormals();

    // material
    const customShaderMaterialUniforms = {
        "material.specular": new Color(Math.random() * 0xffffff),
        "material.shininess": Math.random() * 16,
        "uvwTranslation": uvwTranslation3DX,
        "uvwScale": [1.0, 1.0, 1.0],

        "uInvert": guiData.scannerVolumeInvert,
        "uBrightness": guiData.scannerVolumeBrightness,
        "uContrast": guiData.scannerVolumeContrast,
        "uSobelOperator": guiData.scannerVolumeSobelOperator,
        "uMinThreshold": guiData.scannerVolumeMinThreshold,
        "uMaxThreshold": guiData.scannerVolumeMaxThreshold,
        "uThreshold": guiData.scannerVolumeThreshold,
        "uScannerOpacity": guiData.scannerVolumeOpacity,
        "uSegmentationOpacity": guiData.segmentationVolumeOpacity
    };
    let material = new RC.CustomShaderMaterial("volumeViewer", customShaderMaterialUniforms);
    material.color = new RC.Color(1.0, 1.0, 1.0);
    material.addMap(scannerVolumeTexture);
    material.addMap(segmentationVolumeTexture);
    material.transparent = true;
    material.opacity = 1.0;
    material.side = RC.FRONT_AND_BACK_SIDE;

    // quad
    quad3DX = new RC.Quad(undefined, undefined, material, geometry, true);
}


function initQuad3DY() {
    // /*
    // vertices
    //
    //              V0                V3
    //     (-0.5, -0.5, -0.5)         (0.5, -0.5, -0.5)
    //              X-----------------X
    //             /                 /
    //            /                 /
    //           X-----------------X
    //           V1                V2
    //  (-0.5, -0.5, 0.5)          (0.5, -0.5, 0.5)
    //
    // textureCoords
    //
    //              V0                V3
    //              (0, 1, 0)         (1, 1, 0)
    //              X-----------------X
    //             /                 /
    //            /                 /
    //           X-----------------X
    //           V1                V2
    //           (0, 1, 1)         (1, 1, 1)
    //*/


    // geometry 3DY
    let geometry = new Geometry();
    geometry.vertices = Float32Attribute(
        [
            -0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, -0.5, -0.5
        ], 3
    );
    geometry.vertColor = Float32Attribute(
        [
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1
        ], 4
    );
    geometry.uvw = Float32Attribute(
        [
            0, 1, 0,
            0, 1, 1,
            1, 1, 1,
            1, 1, 0
        ], 3
    );
    geometry.indices = Uint32Attribute([0, 1, 2, 0, 2, 3], 1);
    geometry.computeVertexNormals();

    // material
    const customShaderMaterialUniforms = {
        "material.specular": new Color(Math.random() * 0xffffff),
        "material.shininess": Math.random() * 16,
        "uvwTranslation": uvwTranslation3DY,
        "uvwScale": [1.0, 1.0, 1.0],

        "uInvert": guiData.scannerVolumeInvert,
        "uBrightness": guiData.scannerVolumeBrightness,
        "uContrast": guiData.scannerVolumeContrast,
        "uSobelOperator": guiData.scannerVolumeSobelOperator,
        "uMinThreshold": guiData.scannerVolumeMinThreshold,
        "uMaxThreshold": guiData.scannerVolumeMaxThreshold,
        "uThreshold": guiData.scannerVolumeThreshold,
        "uScannerOpacity": guiData.scannerVolumeOpacity,
        "uSegmentationOpacity": guiData.segmentationVolumeOpacity
    };
    let material = new RC.CustomShaderMaterial("volumeViewer", customShaderMaterialUniforms);
    material.color = new RC.Color(1.0, 1.0, 1.0);
    material.addMap(scannerVolumeTexture);
    material.addMap(segmentationVolumeTexture);
    material.transparent = true;
    material.opacity = 1.0;
    material.side = RC.FRONT_AND_BACK_SIDE;

    // quad
    quad3DY = new RC.Quad(undefined, undefined, material, geometry, true);
}


function initQuad3DZ() {
    // /*
    // vertices
    //
    //       V0               V3
    //  (-0.5, 0.5, -0.5)     (0.5, 0.5, -0.5)
    //       X----------------X
    //       |                |
    //       |                |
    //       |                |
    //       |                |
    //       |                |
    //       X----------------X
    //       V1               V2
    //  (-0.5, -0.5, -0.5)    (0.5, -0.5, -0.5)
    //
    // textureCoords
    //
    //       V0               V3
    //       (0, 0, 0)        (1, 0, 0)
    //       X----------------X
    //       |                |
    //       |                |
    //       |                |
    //       |                |
    //       |                |
    //       X----------------X
    //       V1               V2
    //       (0, 1, 0)        (1, 1, 0)
    // */


    // geometry
    let geometry = new Geometry();
    geometry.vertices = Float32Attribute(
        [
            -0.5, 0.5, -0.5,
            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5, 0.5, -0.5
        ], 3
    );
    geometry.vertColor = Float32Attribute(
        [
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1
        ], 4
    );
    geometry.uvw = Float32Attribute(
        [
            0, 0, 0,
            0, 1, 0,
            1, 1, 0,
            1, 0, 0
        ], 3
    );
    geometry.indices = Uint32Attribute([0, 1, 2, 0, 2, 3], 1);
    geometry.computeVertexNormals();

    // material
    const customShaderMaterialUniforms = {
        "material.specular": new Color(Math.random() * 0xffffff),
        "material.shininess": Math.random() * 16,
        "uvwTranslation": uvwTranslation3DZ,
        "uvwScale": [1.0, 1.0, 1.0],

        "uInvert": guiData.scannerVolumeInvert,
        "uBrightness": guiData.scannerVolumeBrightness,
        "uContrast": guiData.scannerVolumeContrast,
        "uSobelOperator": guiData.scannerVolumeSobelOperator,
        "uMinThreshold": guiData.scannerVolumeMinThreshold,
        "uMaxThreshold": guiData.scannerVolumeMaxThreshold,
        "uThreshold": guiData.scannerVolumeThreshold,
        "uScannerOpacity": guiData.scannerVolumeOpacity,
        "uSegmentationOpacity": guiData.segmentationVolumeOpacity
    };
    let material = new RC.CustomShaderMaterial("volumeViewer", customShaderMaterialUniforms);
    material.color = new RC.Color(1.0, 1.0, 1.0);
    material.addMap(scannerVolumeTexture);
    material.addMap(segmentationVolumeTexture);
    material.transparent = true;
    material.opacity = 1.0;
    material.side = RC.FRONT_AND_BACK_SIDE;

    // quad
    quad3DZ = new RC.Quad(undefined, undefined, material, geometry, true);
}


function initAxisXLine3D() {
    // geometry
    let geometry = new Geometry();
    geometry.vertices = Float32Attribute(
        [
            -0.5, -0.5, -0.5,
            10.0, -0.5, -0.5
        ], 3
    );

    // material
    let material = new RC.MeshBasicMaterial();
    material.color = new RC.Color(1.0, 0.0, 0.0);
    material.lights = false;

    // line
    axisXLine3D = new RC.Line(geometry, material);
    axisXLine3D.renderingPrimitive = RC.LINES;
}


function initAxisYLine3D() {
    // geometry
    let geometry = new Geometry();
    geometry.vertices = Float32Attribute(
        [
            -0.5, -0.5, -0.5,
            -0.5, 10.0, -0.5
        ], 3
    );

    // material
    let material = new RC.MeshBasicMaterial();
    material.color = new RC.Color(0.0, 1.0, 0.0);
    material.lights = false;

    // line
    axisYLine3D = new RC.Line(geometry, material);
    axisYLine3D.renderingPrimitive = RC.LINES;
}


function initAxisZLine3D() {
    // geometry
    let geometry = new Geometry();
    geometry.vertices = Float32Attribute(
        [
            -0.5, -0.5, -0.5,
            -0.5, -0.5, 10.0
        ], 3
    );

    // material
    let material = new RC.MeshBasicMaterial();
    material.color = new RC.Color(0.0, 0.0, 1.0);
    material.lights = false;

    // line
    axisZLine3D = new RC.Line(geometry, material);
    axisZLine3D.renderingPrimitive = RC.LINES;
}


function initCubeLines3D() {

    // /*
    // vertices
    //
    //              V4                V7
    //              X-----------------X
    //             /|                /|
    //         V5 / |            V6 / |
    //           X-----------------X  |
    //           |  |              |  |
    //           |  |              |  |
    //           |  X--------------|--X
    //           | / V0            | / V3
    //           |/                |/
    //           X-----------------X
    //           V1                V2
    //
    //
    //  V0 (-0.5, -0.5, -0.5)
    //  V1 (-0.5, -0.5, 0.5)
    //  V2 (0.5, -0.5, 0.5)
    //  V3 (0.5, -0.5, -0.5)
    //  V4 (-0.5, 0.5, -0.5)
    //  V5 (-0.5, 0.5, 0.5)
    //  V6 (0.5, 0.5, 0.5)
    //  V7 (0.5, 0.5, -0.5)


    // material
    let material = new RC.MeshBasicMaterial();
    material.color = new RC.Color(1.0, 0.0, 1.0);
    material.lights = false;

    // lineV0V1
    let geometryV0V1 = new Geometry();
    geometryV0V1.vertices = Float32Attribute([-0.5, -0.5, -0.5, -0.5, -0.5, 0.5], 3);
    cubeLineV0V13D = new RC.Line(geometryV0V1, material);
    cubeLineV0V13D.renderingPrimitive = RC.LINES;
    // lineV1V2
    let geometryV1V2 = new Geometry();
    geometryV1V2.vertices = Float32Attribute([-0.5, -0.5, 0.5, 0.5, -0.5, 0.5], 3);
    cubeLineV1V23D = new RC.Line(geometryV1V2, material);
    cubeLineV1V23D.renderingPrimitive = RC.LINES;
    // lineV2V3
    let geometryV2V3 = new Geometry();
    geometryV2V3.vertices = Float32Attribute([0.5, -0.5, 0.5, 0.5, -0.5, -0.5], 3);
    cubeLineV2V33D = new RC.Line(geometryV2V3, material);
    cubeLineV2V33D.renderingPrimitive = RC.LINES;
    // lineV3V4
    let geometryV3V0 = new Geometry();
    geometryV3V0.vertices = Float32Attribute([0.5, -0.5, -0.5, -0.5, -0.5, -0.5], 3);
    cubeLineV3V03D = new RC.Line(geometryV3V0, material);
    cubeLineV3V03D.renderingPrimitive = RC.LINES;


    // lineV4V5
    let geometryV4V5 = new Geometry();
    geometryV4V5.vertices = Float32Attribute([-0.5, 0.5, -0.5, -0.5, 0.5, 0.5], 3);
    cubeLineV4V53D = new RC.Line(geometryV4V5, material);
    cubeLineV4V53D.renderingPrimitive = RC.LINES;
    // lineV5V6
    let geometryV5V6 = new Geometry();
    geometryV5V6.vertices = Float32Attribute([-0.5, 0.5, 0.5, 0.5, 0.5, 0.5], 3);
    cubeLineV5V63D = new RC.Line(geometryV5V6, material);
    cubeLineV5V63D.renderingPrimitive = RC.LINES;
    // lineV6V7
    let geometryV6V7 = new Geometry();
    geometryV6V7.vertices = Float32Attribute([0.5, 0.5, 0.5, 0.5, 0.5, -0.5], 3);
    cubeLineV6V73D = new RC.Line(geometryV6V7, material);
    cubeLineV6V73D.renderingPrimitive = RC.LINES;
    // lineV7V4
    let geometryV7V4 = new Geometry();
    geometryV7V4.vertices = Float32Attribute([0.5, 0.5, -0.5, -0.5, 0.5, -0.5], 3);
    cubeLineV7V43D = new RC.Line(geometryV7V4, material);
    cubeLineV7V43D.renderingPrimitive = RC.LINES;


    // lineV0V4
    let geometryV0V4 = new Geometry();
    geometryV0V4.vertices = Float32Attribute([-0.5, -0.5, -0.5, -0.5, 0.5, -0.5], 3);
    cubeLineV0V43D = new RC.Line(geometryV0V4, material);
    cubeLineV0V43D.renderingPrimitive = RC.LINES;
    // lineV1V5
    let geometryV1V5 = new Geometry();
    geometryV1V5.vertices = Float32Attribute([-0.5, -0.5, 0.5, -0.5, 0.5, 0.5], 3);
    cubeLineV1V53D = new RC.Line(geometryV1V5, material);
    cubeLineV1V53D.renderingPrimitive = RC.LINES;
    // lineV2V6
    let geometryV2V6 = new Geometry();
    geometryV2V6.vertices = Float32Attribute([0.5, -0.5, 0.5, 0.5, 0.5, 0.5], 3);
    cubeLineV2V63D = new RC.Line(geometryV2V6, material);
    cubeLineV2V63D.renderingPrimitive = RC.LINES;
    // lineV3V7
    let geometryV3V7 = new Geometry();
    geometryV3V7.vertices = Float32Attribute([0.5, -0.5, -0.5, 0.5, 0.5, -0.5], 3);
    cubeLineV3V73D = new RC.Line(geometryV3V7, material);
    cubeLineV3V73D.renderingPrimitive = RC.LINES;
}


function initRenderQueue() {
    const renderPass3D = new RC.RenderPass(
        RC.RenderPass.BASIC,
        (textureMap, additionalData) => {

        },
        (textureMap, additionalData) => {
            // TODO rotacije in translacije
            return {
                scene: scene3D,
                camera: camera3D
            };
        },
        RC.RenderPass.TEXTURE,
        renderPass3DViewport,
        "depthTexture",
        [{
            id: "color",
            textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG
        }]
    );

    const renderPass2D = new RC.RenderPass(
        RC.RenderPass.BASIC,
        (textureMap, additionalData) => {
            quad2D3D.material.clearMaps();
            quad2D3D.material.addMap(textureMap.color);
        },
        (textureMap, additionalData) => {

            return {
                scene: scene2D,
                camera: camera2D
            };
        },
        RC.RenderPass.SCREEN,
        renderPass2DViewport
    );

    renderQueue = new RC.RenderQueue(renderer);
    renderQueue.pushRenderPass(renderPass3D);
    renderQueue.pushRenderPass(renderPass2D);
}


function initControls() {
    initSlicesControls();
    initAdjustmentsControls();
    initSegmentControls();
    initToolsControls();
    initExportControls();
    initSaveControls();
}


function initSlicesControls() {
    const slicesGUI = gui.addFolder('Slices');
    sliceIndexXController = slicesGUI.add(guiData, 'sliceIndexX', 0, textureWidth - 1, 1).name('Index X');
    sliceIndexYController = slicesGUI.add(guiData, 'sliceIndexY', 0, textureHeight - 1, 1).name('Index Y');
    sliceIndexZController = slicesGUI.add(guiData, 'sliceIndexZ', 0, textureDepth - 1, 1).name('Index Z');

    sliceIndexXController.onChange(v => {
        const distance = v / (textureWidth - 1);
        verticesTranslation3DX[0] = distance;
        uvwTranslation3DX[0] = distance;
        uvwTranslation2DX[0] = distance;
        quad3DX.positionX = distance;
    });

    sliceIndexYController.onChange(v => {
        const distance = v / (textureHeight - 1);
        verticesTranslation3DY[1] = distance;
        uvwTranslation3DY[1] = -distance;
        uvwTranslation2DY[1] = -distance;
        quad3DY.positionY = distance;
    });

    sliceIndexZController.onChange(v => {
        const distance = v / (textureDepth - 1);
        verticesTranslation3DZ[2] = distance;
        uvwTranslation3DZ[2] = distance;
        uvwTranslation2DZ[2] = distance;
        quad3DZ.positionZ = distance
    });
}


function initAdjustmentsControls() {
    const adjustmentsGUI = gui.addFolder('Adjustments');

    const adjustmentsScannerVolumeGUI = adjustmentsGUI.addFolder('Scanner volume');
    const scannerVolumeInvertController = adjustmentsScannerVolumeGUI.add(guiData, 'scannerVolumeInvert').name('Invert');
    const scannerVolumeBrightnessController = adjustmentsScannerVolumeGUI.add(guiData, 'scannerVolumeBrightness', -100, 100, 1).name('Brightness');
    const scannerVolumeContrastController = adjustmentsScannerVolumeGUI.add(guiData, 'scannerVolumeContrast', -100, 100, 1).name('Contrast');
    const scannerVolumeSobelOperatorController = adjustmentsScannerVolumeGUI.add(guiData, 'scannerVolumeSobelOperator').name('Sobel operator');
    const scannerVolumeMinThresholdController = adjustmentsScannerVolumeGUI.add(guiData, 'scannerVolumeMinThreshold', 0, 1.0, 0.01).name('Min threshold');
    const scannerVolumeMaxThresholdController = adjustmentsScannerVolumeGUI.add(guiData, 'scannerVolumeMaxThreshold', 0, 1.0, 0.01).name('Max threshold');
    const scannerVolumeThresholdController = adjustmentsScannerVolumeGUI.add(guiData, 'scannerVolumeThreshold').name('Threshold');
    const scannerVolumeOpacityController = adjustmentsScannerVolumeGUI.add(guiData, 'scannerVolumeOpacity', 0, 1.0, 0.1).name('Opacity');

    const adjustmentsSegmentationVolumeGUI = adjustmentsGUI.addFolder('Segmentation volume');
    const segmentationVolumeOpacityController = adjustmentsSegmentationVolumeGUI.add(guiData, 'segmentationVolumeOpacity', 0, 1.0, 0.1).name('Opacity');
}


function initSegmentControls() {
    const segmentGUI = gui.addFolder('Segment');

    const addSegmentGUI = segmentGUI.addFolder('Add');
    const addSegmentNameController = addSegmentGUI.add(guiData, 'addSegmentName').name('Name');
    const addSegmentRGBValuesController = addSegmentGUI.addColor(guiData, 'addSegmentRGBValues').name('Color');
    const addSegmentController = addSegmentGUI.add(guiData, 'addSegment').name('Add');

    const removeSegmentGUI = segmentGUI.addFolder('Remove');
    const removeSegmentNameController = removeSegmentGUI.add(guiData, 'removeSegmentName', guiData.segmentNames).name('Name');
    const removeSegmentController = removeSegmentGUI.add(guiData, 'removeSegment').name('Remove');

    guiData.addSegment = function () {
        const name = guiData.addSegmentName.trim();
        const rgbValues = [
            Math.trunc(guiData.addSegmentRGBValues[0]),
            Math.trunc(guiData.addSegmentRGBValues[1]),
            Math.trunc(guiData.addSegmentRGBValues[2])
        ];

        if (name === "") {
            alert('Segment must have a name.');
            return;
        }
        if (areRGBValuesSame(rgbValues, defaultSegmentRGBValues)) {
            alert('Segment with this color is not allowed');
            return;
        }
        if (isSegmentAlreadyAdded(name, rgbValues)) {
            alert('Segment with this name or color is already added');
            return;
        }


        const segmentNameSelectElement = segmentNameController.domElement.getElementsByTagName('select')[0];
        const segmentNameOptionElement = document.createElement('option');
        segmentNameOptionElement.text = name;
        segmentNameSelectElement.add(segmentNameOptionElement);

        const removeSegmentNameSelectElement = removeSegmentNameController.domElement.getElementsByTagName('select')[0];
        const removeSegmentNameOptionElement = document.createElement('option');
        removeSegmentNameOptionElement.text = name;
        removeSegmentNameSelectElement.add(removeSegmentNameOptionElement);

        const isFirstAddedSegment = guiData.segmentNames.length === 0;
        if (isFirstAddedSegment) {
            segmentNameController.setValue(name);
            removeSegmentNameController.setValue(name);
        }

        // segment
        const segment = new Segment(name, getNewLabel(), rgbValues);
        const segmentBinaryData = new Uint8Array(volumeSize);

        guiData.segmentNames.push(name);
        segmentLabels.push(segment.label);

        segmentNameSegmentDict[segment.name] = segment;
        segmentNameSegmentRGBValuesDict[segment.name] = segment.rgbValues;
        segmentNameSegmentBinaryDataDict[segment.name] = segmentBinaryData;
        segmentLabelSegmentDict[segment.label] = segment;

        segmentationVolume.segments.push(segment);

        addSegmentNameController.setValue('');
        addSegmentRGBValuesController.setValue(defaultSegmentRGBValues);
    };

    guiData.removeSegment = function () {
        const i = guiData.segmentNames.indexOf(guiData.removeSegmentName);

        if (i !== -1) {

            loading('Removing segment...', () => {
                const segmentNameSelectElement = segmentNameController.domElement.getElementsByTagName('select')[0];
                segmentNameSelectElement.remove(i);

                const removeSegmentNameSelectElement = removeSegmentNameController.domElement.getElementsByTagName('select')[0];
                removeSegmentNameSelectElement.remove(i);

                if (guiData.removeSegmentName === guiData.segmentName) {
                    segmentNameController.setValue('');
                    painting = false;
                }

                const removeSegment = segmentNameSegmentDict[guiData.removeSegmentName];

                for(let i=0; i<volumeSize; i++) {
                    if(segmentationVolumeLabelData[i] === removeSegment.label) {
                        segmentationVolumeLabelData[i] = 0;
                    }
                }

                recolorSegment(removeSegment.name, defaultSegmentRGBValues);
                guiData.segmentNames.splice(i, 1);
                segmentLabels = segmentLabels.filter(label => label !== removeSegment.label);
                delete segmentLabelSegmentDict[removeSegment.label];
                delete segmentNameSegmentDict[removeSegment.name];
                scene3D.remove(segmentNameSegmentMeshDict[removeSegment.name]);
                delete segmentNameSegmentMeshDict[removeSegment.name];
                delete segmentNameSegmentRGBValuesDict[removeSegment.name];
                delete segmentNameSegmentBinaryDataDict[removeSegment.name];


                const index = segmentationVolume.segments.findIndex(segment => segment.name === removeSegment.name);
                if (index > -1) {
                    segmentationVolume.segments.splice(index, 1);
                }

                removeSegmentNameController.setValue('');
            });
        }
    };
}


function initToolsControls() {
    const toolsGUI = gui.addFolder('Tools');
    segmentNameController = toolsGUI.add(guiData, 'segmentName', guiData.segmentNames).name('Segment name');

    const brushGUI = toolsGUI.addFolder('Brush');
    const brushSizeController = brushGUI.add(guiData, 'brushSize', 1, 50, 1).name('Brush size');
    const brushActiveController = brushGUI.add(guiData, 'brushActive').name('Active');

    const eraserGUI = toolsGUI.addFolder('Eraser');
    const eraserSizeController = eraserGUI.add(guiData, 'eraserSize', 1, 50, 1).name('Eraser size');
    const eraserActiveController = eraserGUI.add(guiData, 'eraserActive').name('Active');

    const recolorGUI = toolsGUI.addFolder('Recolor');
    const recolorRGBValuesController = recolorGUI.addColor(guiData, 'recolorRGBValues').name('Color');
    const recolorController = recolorGUI.add(guiData, 'recolor').name('Recolor');

    const autoSegmentationGUI = toolsGUI.addFolder('Automatic segmentation');
    const autoSegmentationAxisController = autoSegmentationGUI.add(guiData, 'autoSegmentationAxis', guiData.axes).name('Axis');
    const autoSegmentationStartSliceIndexController = autoSegmentationGUI.add(guiData, 'autoSegmentationStartSliceIndex', 0, textureWidth - 1, 1).name('Start slice index');
    const autoSegmentationEndSliceIndexController = autoSegmentationGUI.add(guiData, 'autoSegmentationEndSliceIndex', 0, textureWidth - 1, 1).name('End slice index');
    const autoSegmentationController = autoSegmentationGUI.add(guiData, 'autoSegmentation').name('Segment');

    const meshGUI = toolsGUI.addFolder('Mesh');
    const showMeshGUI = meshGUI.addFolder('Show');
    const showSelectedSegmentMeshController = showMeshGUI.add(guiData, 'showSelectedSegmentMesh').name('Selected segment');
    const showAllSegmentMeshesController = showMeshGUI.add(guiData, 'showAllSegmentMeshes').name('All segments');
    const hideMeshGUI = meshGUI.addFolder('Hide');
    const hideSegmentMeshConstructorController = hideMeshGUI.add(guiData, 'hideSelectedSegmentMesh').name('Selected segment');
    const hideAllSegmentMeshesController = hideMeshGUI.add(guiData, 'hideAllSegmentMeshes').name('All segments');


    segmentNameController.onChange(v => {
        const rgbValues = !!segmentNameSegmentRGBValuesDict[guiData.segmentName] ?
            segmentNameSegmentRGBValuesDict[guiData.segmentName] :
            defaultSegmentRGBValues;
        recolorRGBValuesController.setValue(rgbValues);
        paintRGBValues = guiData.brushActive ? rgbValues : eraserRGBValues;
    });

    brushSizeController.onChange(v => {
        if (guiData.brushActive) {
            paintStrokeSize = guiData.brushSize;
        }
    });

    brushActiveController.onChange(v => {
        if (v) {
            paintRGBValues = !!segmentNameSegmentRGBValuesDict[guiData.segmentName] ?
                segmentNameSegmentRGBValuesDict[guiData.segmentName] :
                defaultSegmentRGBValues;
            paintStrokeSize = guiData.brushSize;
            eraserActiveController.setValue(false);
        }
    });

    eraserSizeController.onChange(v => {
        if (guiData.eraserActive) {
            paintStrokeSize = guiData.eraserSize;
        }
    });

    eraserActiveController.onChange(v => {
        if (v) {
            paintRGBValues = eraserRGBValues;
            paintStrokeSize = guiData.eraserSize;
            brushActiveController.setValue(false);
        }
    });

    guiData.recolor = function () {
        const recolorRGBValues = guiData.recolorRGBValues;
        const newRGBValues = [
            Math.trunc(recolorRGBValues[0]),
            Math.trunc(recolorRGBValues[1]),
            Math.trunc(recolorRGBValues[2])
        ];

        if (areRGBValuesSame(newRGBValues, defaultSegmentRGBValues)) {
            return;
        }

        if (findSegmentByRGBValues(newRGBValues)) {
            return;
        }

        paintRGBValues = guiData.brushActive ? newRGBValues : eraserRGBValues;

        loading('Recoloring...', () => recolorSegment(guiData.segmentName, newRGBValues));
    };

    guiData.autoSegmentation = function () {
        loading('Automatic segmentation...', () => autoSegmentation());
    };

    guiData.showSelectedSegmentMesh = function () {
        loading('Showing selected segment mesh...', () => showSelectedSegmentMesh());
    };

    guiData.showAllSegmentMeshes = function () {
        loading('Showing all segment meshes...', () => showAllSegmentMeshes());
    };

    guiData.hideSelectedSegmentMesh = function () {
        loading('Hiding selected segment mesh...', () => hideSelectedSegmentMesh());
    };

    guiData.hideAllSegmentMeshes = function () {
        loading('Hiding all segment meshes...', () => hideAllSegmentMeshes());
    };
}


function updateUniforms() {

    // invert
    quad2DX.material.setUniform("uInvert", guiData.scannerVolumeInvert);
    quad2DY.material.setUniform("uInvert", guiData.scannerVolumeInvert);
    quad2DZ.material.setUniform("uInvert", guiData.scannerVolumeInvert);
    quad3DX.material.setUniform("uInvert", guiData.scannerVolumeInvert);
    quad3DY.material.setUniform("uInvert", guiData.scannerVolumeInvert);
    quad3DZ.material.setUniform("uInvert", guiData.scannerVolumeInvert);

    // brightness
    quad2DX.material.setUniform("uBrightness", guiData.scannerVolumeBrightness);
    quad2DY.material.setUniform("uBrightness", guiData.scannerVolumeBrightness);
    quad2DZ.material.setUniform("uBrightness", guiData.scannerVolumeBrightness);
    quad3DX.material.setUniform("uBrightness", guiData.scannerVolumeBrightness);
    quad3DY.material.setUniform("uBrightness", guiData.scannerVolumeBrightness);
    quad3DZ.material.setUniform("uBrightness", guiData.scannerVolumeBrightness);

    // contrast
    quad2DX.material.setUniform("uContrast", guiData.scannerVolumeContrast);
    quad2DY.material.setUniform("uContrast", guiData.scannerVolumeContrast);
    quad2DZ.material.setUniform("uContrast", guiData.scannerVolumeContrast);
    quad3DX.material.setUniform("uContrast", guiData.scannerVolumeContrast);
    quad3DY.material.setUniform("uContrast", guiData.scannerVolumeContrast);
    quad3DZ.material.setUniform("uContrast", guiData.scannerVolumeContrast);

    // sobel operator
    quad2DX.material.setUniform("uSobelOperator", guiData.scannerVolumeSobelOperator);
    quad2DY.material.setUniform("uSobelOperator", guiData.scannerVolumeSobelOperator);
    quad2DZ.material.setUniform("uSobelOperator", guiData.scannerVolumeSobelOperator);
    quad3DX.material.setUniform("uSobelOperator", guiData.scannerVolumeSobelOperator);
    quad3DY.material.setUniform("uSobelOperator", guiData.scannerVolumeSobelOperator);
    quad3DZ.material.setUniform("uSobelOperator", guiData.scannerVolumeSobelOperator);

    // minThreshold
    quad2DX.material.setUniform("uMinThreshold", guiData.scannerVolumeMinThreshold);
    quad2DY.material.setUniform("uMinThreshold", guiData.scannerVolumeMinThreshold);
    quad2DZ.material.setUniform("uMinThreshold", guiData.scannerVolumeMinThreshold);
    quad3DX.material.setUniform("uMinThreshold", guiData.scannerVolumeMinThreshold);
    quad3DY.material.setUniform("uMinThreshold", guiData.scannerVolumeMinThreshold);
    quad3DZ.material.setUniform("uMinThreshold", guiData.scannerVolumeMinThreshold);

    // maxThreshold
    quad2DX.material.setUniform("uMaxThreshold", guiData.scannerVolumeMaxThreshold);
    quad2DY.material.setUniform("uMaxThreshold", guiData.scannerVolumeMaxThreshold);
    quad2DZ.material.setUniform("uMaxThreshold", guiData.scannerVolumeMaxThreshold);
    quad3DX.material.setUniform("uMaxThreshold", guiData.scannerVolumeMaxThreshold);
    quad3DY.material.setUniform("uMaxThreshold", guiData.scannerVolumeMaxThreshold);
    quad3DZ.material.setUniform("uMaxThreshold", guiData.scannerVolumeMaxThreshold);

    // threshold
    quad2DX.material.setUniform("uThreshold", guiData.scannerVolumeThreshold);
    quad2DY.material.setUniform("uThreshold", guiData.scannerVolumeThreshold);
    quad2DZ.material.setUniform("uThreshold", guiData.scannerVolumeThreshold);
    quad3DX.material.setUniform("uThreshold", guiData.scannerVolumeThreshold);
    quad3DY.material.setUniform("uThreshold", guiData.scannerVolumeThreshold);
    quad3DZ.material.setUniform("uThreshold", guiData.scannerVolumeThreshold);

    // scanner opacity
    quad2DX.material.setUniform("uScannerOpacity", guiData.scannerVolumeOpacity);
    quad2DY.material.setUniform("uScannerOpacity", guiData.scannerVolumeOpacity);
    quad2DZ.material.setUniform("uScannerOpacity", guiData.scannerVolumeOpacity);
    quad3DX.material.setUniform("uScannerOpacity", guiData.scannerVolumeOpacity);
    quad3DY.material.setUniform("uScannerOpacity", guiData.scannerVolumeOpacity);
    quad3DZ.material.setUniform("uScannerOpacity", guiData.scannerVolumeOpacity);

    // segmentation opacity
    quad2DX.material.setUniform("uSegmentationOpacity", guiData.segmentationVolumeOpacity);
    quad2DY.material.setUniform("uSegmentationOpacity", guiData.segmentationVolumeOpacity);
    quad2DZ.material.setUniform("uSegmentationOpacity", guiData.segmentationVolumeOpacity);
    quad3DX.material.setUniform("uSegmentationOpacity", guiData.segmentationVolumeOpacity);
    quad3DY.material.setUniform("uSegmentationOpacity", guiData.segmentationVolumeOpacity);
    quad3DZ.material.setUniform("uSegmentationOpacity", guiData.segmentationVolumeOpacity);
}


function setCanvasDimensions() {
    const minSize = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = minSize;
    canvas.height = minSize;
}


function setRenderPassDimensions() {
    const minSize = Math.min(window.innerWidth, window.innerHeight);

    renderPass3DViewport.width = minSize;
    renderPass3DViewport.height = minSize;

    renderPass2DViewport.width = minSize;
    renderPass2DViewport.height = minSize;
}


function setView3DCoverSizeAndPosition() {
    const minSize = Math.min(window.innerWidth, window.innerHeight);
    const coverSize = minSize / 2;
    view3DCover.style.width = coverSize.toString() + 'px';
    view3DCover.style.height = coverSize.toString() + 'px';
    view3DCover.style.top = coverSize.toString() + 'px';
    view3DCover.style.left = coverSize.toString() + 'px';
}


function setCanvasLabelsPosition() {
    const minSize = Math.min(window.innerWidth, window.innerHeight);
    const distance = minSize / 2;

    axisYCanvasLabel.style.top = distance.toString() + 'px';

    axisZCanvasLabel.style.left = distance.toString() + 'px';

    view3DCanvasLabel.style.top = distance.toString() + 'px';
    view3DCanvasLabel.style.left = distance.toString() + 'px';
}


function resize() {
    setCanvasDimensions();
    setRenderPassDimensions();
    setView3DCoverSizeAndPosition();
    setCanvasLabelsPosition();
}


function render() {
    const input = {
        keyboard: keyboard.keyboardInput.update(),
        navigators: {
            rotation: keyboard.keyboardRotation,
            translation: keyboard.keyboardTranslation
        },
        mouse: mouse.mouseInput.update(),
        gamepads: undefined,
        multiplier: 1
    };

    cameraManager.update(input, 33);

    updateUniforms();

    renderQueue.render();

    // 2D
    // renderer.render(scene2D, camera2D);

    // 3D
    // renderer.render(scene3D, camera3D);

    window.requestAnimationFrame(() => {
        render();
    });
}


function initEventListeners() {
    initCanvasWheelEventListener();
    initCanvasMouseEnterEventListener();
    initCanvasMouseLeaveEventListener();
    initCanvasMouseDownEventListener();
    initCanvasMouseMoveEventListener();
    initCanvasMouseUpEventListener();
    initKeydownEventListener();
}


function initCanvasWheelEventListener() {
    canvas.addEventListener('wheel', event => {
        const canvasX = event.offsetX;
        const canvasY = event.offsetY;
        const delta = event.deltaY < 0 ? 1 : -1;
        moveSlice(canvasX, canvasY, delta);
        event.preventDefault();
    });
}


function initCanvasMouseEnterEventListener() {
    canvas.addEventListener('mouseenter', event => {
        mouseOnCanvas = true;
    });
}


function initCanvasMouseLeaveEventListener() {
    canvas.addEventListener('mouseleave', event => {
        mouseOnCanvas = false;
    });
}


function initCanvasMouseDownEventListener() {
    canvas.addEventListener('mousedown', event => {
        if ((guiData.brushActive || guiData.eraserActive) && guiData.segmentName) {
            painting = true;
            const canvasMouseDownX = event.offsetX;
            const canvasMouseDownY = event.offsetY;
            paint(canvasMouseDownX, canvasMouseDownY);
        }
    });
}


function initCanvasMouseMoveEventListener() {
    canvas.addEventListener('mousemove', event => {
        canvasMouseMoveX = event.offsetX;
        canvasMouseMoveY = event.offsetY;

        setPaintStrokeSvgCursor(canvasMouseMoveX, canvasMouseMoveY);

        if (painting) {
            paint(canvasMouseMoveX, canvasMouseMoveY);
        }
    });
}


function initCanvasMouseUpEventListener() {
    canvas.addEventListener('mouseup', event => {
        if (painting) {
            const canvasMouseUpX = event.offsetX;
            const canvasMouseUpY = event.offsetY;
            painting = false;
        }
    });
}


function initKeydownEventListener() {
    document.addEventListener('keydown', event => {
        if (!mouseOnCanvas) {
            return;
        }

        if (event.keyCode == '38') { // up arrow
            scaleUVW(canvasMouseMoveX, canvasMouseMoveY, 0.01);
            event.preventDefault();
        } else if (event.keyCode == '40') { // down arrow
            scaleUVW(canvasMouseMoveX, canvasMouseMoveY, -0.01);
            event.preventDefault();
        } else if (event.keyCode == '87') { // W
            translateUVW(canvasMouseMoveX, canvasMouseMoveY, -0.01, 0.0);
            event.preventDefault();
        } else if (event.keyCode == '83') { // S
            translateUVW(canvasMouseMoveX, canvasMouseMoveY, 0.01, 0.0);
            event.preventDefault();
        } else if (event.keyCode == '65') { // A
            translateUVW(canvasMouseMoveX, canvasMouseMoveY, 0.0, 0.01);
            event.preventDefault();
        } else if (event.keyCode == '68') { // D
            translateUVW(canvasMouseMoveX, canvasMouseMoveY, 0.0, -0.01);
            event.preventDefault();
        }
    });
}


function moveSlice(canvasX, canvasY, delta) {
    const viewWidth = canvas.width / 2;
    const viewHeight = canvas.height / 2;

    if (0 < canvasX && canvasX < viewWidth && 0 < canvasY && canvasY < viewHeight) {
        const newValue = guiData.sliceIndexX + delta;
        if (newValue < 0 || textureWidth < newValue) {
            return;
        }
        sliceIndexXController.setValue(guiData.sliceIndexX + delta);
    } else if (0 < canvasX && canvasX < viewWidth && viewHeight < canvasY && canvasY < canvas.height) {
        const newValue = guiData.sliceIndexY + delta;
        if (newValue < 0 || textureHeight < newValue) {
            return;
        }
        sliceIndexYController.setValue(guiData.sliceIndexY + delta)
    } else if (viewWidth < canvasX && canvasX < canvas.width && 0 < canvasY && canvasY < viewHeight) {
        const newValue = guiData.sliceIndexZ + delta;
        if (newValue < 0 || textureDepth < newValue) {
            return;
        }
        sliceIndexZController.setValue(guiData.sliceIndexZ + delta)
    }
}


function scaleUVW(canvasX, canvasY, delta) {
    const viewWidth = canvas.width / 2;
    const viewHeight = canvas.height / 2;

    if (0 < canvasX && canvasX < viewWidth && 0 < canvasY && canvasY < viewHeight) {

        const currentScaleValue = uvwScale2DX[1];
        const newScaleValue = currentScaleValue - delta;
        if (newScaleValue < 0.1 || 1.0 < newScaleValue) {
            return;
        }

        const currentTextureSubHeight = textureHeight * uvwScale2DX[1];
        const currentTextureSubDepth = textureDepth * uvwScale2DX[2];

        const currentTextureSubOffsetY = textureHeight * uvwTranslation2DX[1];
        const currentTextureSubOffsetZ = textureDepth * uvwTranslation2DX[2];

        uvwScale2DX[1] -= delta;
        uvwScale2DX[2] -= delta;

        const newTextureSubHeight = textureHeight * uvwScale2DX[1];
        const newTextureSubDepth = textureDepth * uvwScale2DX[2];

        let newTextureSubOffsetY = currentTextureSubOffsetY + (currentTextureSubHeight - newTextureSubHeight) / 2;
        let newTextureSubOffsetZ = currentTextureSubOffsetZ + (currentTextureSubDepth - newTextureSubDepth) / 2;

        if (newTextureSubOffsetY < 0) {
            newTextureSubOffsetY = 0;
        }
        if (newTextureSubOffsetY + newTextureSubHeight > textureHeight) {
            newTextureSubOffsetY = textureHeight - newTextureSubHeight;
        }
        if (newTextureSubOffsetZ < 0) {
            newTextureSubOffsetZ = 0;
        }
        if (newTextureSubOffsetZ + newTextureSubDepth > textureDepth) {
            newTextureSubOffsetZ = textureDepth - newTextureSubDepth;
        }

        uvwTranslation2DX[1] = newTextureSubOffsetY / textureHeight;
        uvwTranslation2DX[2] = newTextureSubOffsetZ / textureDepth;

    } else if (0 < canvasX && canvasX < viewWidth && viewHeight < canvasY && canvasY < canvas.height) {

        const currentScaleValue = uvwScale2DY[0];
        const newScaleValue = currentScaleValue - delta;
        if (newScaleValue < 0.1 || 1.0 < newScaleValue) {
            return;
        }

        const currentTextureSubWidth = textureWidth * uvwScale2DY[0];
        const currentTextureSubDepth = textureDepth * uvwScale2DY[2];

        const currentTextureSubOffsetX = textureWidth * uvwTranslation2DY[0];
        const currentTextureSubOffsetZ = textureDepth * uvwTranslation2DY[2];

        uvwScale2DY[0] -= delta;
        uvwScale2DY[2] -= delta;

        const newTextureSubWidth = textureWidth * uvwScale2DY[0];
        const newTextureSubDepth = textureDepth * uvwScale2DY[2];

        let newTextureSubOffsetX = currentTextureSubOffsetX + (currentTextureSubWidth - newTextureSubWidth) / 2;
        let newTextureSubOffsetZ = currentTextureSubOffsetZ + (currentTextureSubDepth - newTextureSubDepth) / 2;

        if (newTextureSubOffsetX < 0) {
            newTextureSubOffsetX = 0;
        }
        if (newTextureSubOffsetX + newTextureSubWidth > textureWidth) {
            newTextureSubOffsetX = textureWidth - newTextureSubWidth;
        }
        if (newTextureSubOffsetZ < 0) {
            newTextureSubOffsetZ = 0;
        }
        if (newTextureSubOffsetZ + newTextureSubDepth > textureDepth) {
            newTextureSubOffsetZ = textureDepth - newTextureSubDepth;
        }

        uvwTranslation2DY[0] = newTextureSubOffsetX / textureWidth;
        uvwTranslation2DY[2] = newTextureSubOffsetZ / textureDepth;

    } else if (viewWidth < canvasX && canvasX < canvas.width && 0 < canvasY && canvasY < viewHeight) {

        const currentScaleValue = uvwScale2DZ[0];
        const newScaleValue = currentScaleValue - delta;
        if (newScaleValue < 0.1 || 1.0 < newScaleValue) {
            return;
        }

        const currentTextureSubWidth = textureWidth * uvwScale2DZ[0];
        const currentTextureSubHeight = textureHeight * uvwScale2DZ[1];

        const currentTextureSubOffsetX = textureWidth * uvwTranslation2DZ[0];
        const currentTextureSubOffsetY = textureHeight * uvwTranslation2DZ[1];

        uvwScale2DZ[0] -= delta;
        uvwScale2DZ[1] -= delta;

        const newTextureSubWidth = textureWidth * uvwScale2DZ[0];
        const newTextureSubHeight = textureHeight * uvwScale2DZ[1];

        let newTextureSubOffsetX = currentTextureSubOffsetX + (currentTextureSubWidth - newTextureSubWidth) / 2;
        let newTextureSubOffsetY = currentTextureSubOffsetY + (currentTextureSubHeight - newTextureSubHeight) / 2;

        if (newTextureSubOffsetX < 0) {
            newTextureSubOffsetX = 0;
        }
        if (newTextureSubOffsetX + newTextureSubWidth > textureWidth) {
            newTextureSubOffsetX = textureWidth - newTextureSubWidth;
        }
        if (newTextureSubOffsetY < 0) {
            newTextureSubOffsetY = 0;
        }
        if (newTextureSubOffsetY + newTextureSubHeight > textureHeight) {
            newTextureSubOffsetY = textureHeight - newTextureSubHeight;
        }

        uvwTranslation2DZ[0] = newTextureSubOffsetX / textureWidth;
        uvwTranslation2DZ[1] = newTextureSubOffsetY / textureHeight;
    }
}


function translateUVW(canvasX, canvasY, verticalDelta, horizontalDelta) {
    const viewWidth = canvas.width / 2;
    const viewHeight = canvas.height / 2;

    if (0 < canvasX && canvasX < viewWidth && 0 < canvasY && canvasY < viewHeight) {
        const currentTextureSubHeight = textureHeight * uvwScale2DX[1];
        const currentTextureSubDepth = textureDepth * uvwScale2DX[2];

        const currentTextureSubOffsetY = textureHeight * uvwTranslation2DX[1];
        const currentTextureSubOffsetZ = textureDepth * uvwTranslation2DX[2];

        const newTextureSubHeight = currentTextureSubHeight;
        const newTextureSubDepth = currentTextureSubDepth;

        let newTextureSubOffsetY = currentTextureSubOffsetY + textureHeight * verticalDelta;
        let newTextureSubOffsetZ = currentTextureSubOffsetZ + textureDepth * horizontalDelta;

        if (newTextureSubOffsetY < 0) {
            newTextureSubOffsetY = 0;
        }
        if (newTextureSubOffsetY + newTextureSubHeight > textureHeight) {
            newTextureSubOffsetY = textureHeight - newTextureSubHeight;
        }
        if (newTextureSubOffsetZ < 0) {
            newTextureSubOffsetZ = 0;
        }
        if (newTextureSubOffsetZ + newTextureSubDepth > textureDepth) {
            newTextureSubOffsetZ = textureDepth - newTextureSubDepth;
        }

        uvwTranslation2DX[1] = newTextureSubOffsetY / textureHeight;
        uvwTranslation2DX[2] = newTextureSubOffsetZ / textureDepth;

    } else if (0 < canvasX && canvasX < viewWidth && viewHeight < canvasY && canvasY < canvas.height) {

        const currentTextureSubWidth = textureWidth * uvwScale2DY[0];
        const currentTextureSubDepth = textureDepth * uvwScale2DY[2];

        const currentTextureSubOffsetX = textureWidth * uvwTranslation2DY[0];
        const currentTextureSubOffsetZ = textureDepth * uvwTranslation2DY[2];

        const newTextureSubWidth = currentTextureSubWidth;
        const newTextureSubDepth = currentTextureSubDepth;

        let newTextureSubOffsetX = currentTextureSubOffsetX + textureWidth * -horizontalDelta;
        let newTextureSubOffsetZ = currentTextureSubOffsetZ + textureDepth * verticalDelta;

        if (newTextureSubOffsetX < 0) {
            newTextureSubOffsetX = 0;
        }
        if (newTextureSubOffsetX + newTextureSubWidth > textureWidth) {
            newTextureSubOffsetX = textureWidth - newTextureSubWidth;
        }
        if (newTextureSubOffsetZ < 0) {
            newTextureSubOffsetZ = 0;
        }
        if (newTextureSubOffsetZ + newTextureSubDepth > textureDepth) {
            newTextureSubOffsetZ = textureDepth - newTextureSubDepth;
        }

        uvwTranslation2DY[0] = newTextureSubOffsetX / textureWidth;
        uvwTranslation2DY[2] = newTextureSubOffsetZ / textureDepth;

    } else if (viewWidth < canvasX && canvasX < canvas.width && 0 < canvasY && canvasY < viewHeight) {

        const currentTextureSubWidth = textureWidth * uvwScale2DZ[0];
        const currentTextureSubHeight = textureHeight * uvwScale2DZ[1];

        const currentTextureSubOffsetX = textureWidth * uvwTranslation2DZ[0];
        const currentTextureSubOffsetY = textureHeight * uvwTranslation2DZ[1];

        const newTextureSubWidth = currentTextureSubWidth;
        const newTextureSubHeight = currentTextureSubHeight;

        let newTextureSubOffsetX = currentTextureSubOffsetX + textureWidth * -horizontalDelta;
        let newTextureSubOffsetY = currentTextureSubOffsetY + textureHeight * verticalDelta;

        if (newTextureSubOffsetX < 0) {
            newTextureSubOffsetX = 0;
        }
        if (newTextureSubOffsetX + newTextureSubWidth > textureWidth) {
            newTextureSubOffsetX = textureWidth - newTextureSubWidth;
        }
        if (newTextureSubOffsetY < 0) {
            newTextureSubOffsetY = 0;
        }
        if (newTextureSubOffsetY + newTextureSubHeight > textureHeight) {
            newTextureSubOffsetY = textureHeight - newTextureSubHeight;
        }

        uvwTranslation2DZ[0] = newTextureSubOffsetX / textureWidth;
        uvwTranslation2DZ[1] = newTextureSubOffsetY / textureHeight;
    }
}


function areRGBValuesSame(valuesA, valuesB) {
    return valuesA[0] === valuesB[0] && valuesA[1] === valuesB[1] && valuesA[2] === valuesB[2];
}


function isSegmentAlreadyAdded(name, rgbValues) {
    if (guiData.segmentNames.includes(name)) {
        return true;
    }


    if (!!findSegmentByRGBValues(rgbValues)) {
        return true;
    }

    return false;
}


function removeSegmentByName(name) {
    if (name === guiData.segmentName) {
        painting = false;
    }

    recolorSegment(name, defaultSegmentRGBValues);

    delete segmentNameSegmentDict[name];
    scene3D.remove(segmentNameSegmentMeshDict[name]);
    delete segmentNameSegmentMeshDict[name];
    delete segmentNameSegmentRGBValuesDict[name];
}


function recolorSegment(segmentName, newRGBValues) {
    const oldRGBValues = segmentNameSegmentRGBValuesDict[segmentName];

    if (areRGBValuesSame(oldRGBValues, newRGBValues)) {
        return;
    }

    for (let k = 0; k < textureDepth; ++k) {
        for (let i = 0; i < textureHeight; ++i) {
            for (let j = 0; j < textureWidth; ++j) {
                const segmentationVoxelIndex = (j + i * textureWidth + k * textureWidth * textureHeight) * 3;

                let segmentationVoxelRGBValues = [
                    segmentationVolumeTextureData[segmentationVoxelIndex + 0],
                    segmentationVolumeTextureData[segmentationVoxelIndex + 1],
                    segmentationVolumeTextureData[segmentationVoxelIndex + 2]
                ];

                if (areRGBValuesSame(segmentationVoxelRGBValues, oldRGBValues)) {
                    segmentationVolumeTextureData[segmentationVoxelIndex + 0] = newRGBValues[0];
                    segmentationVolumeTextureData[segmentationVoxelIndex + 1] = newRGBValues[1];
                    segmentationVolumeTextureData[segmentationVoxelIndex + 2] = newRGBValues[2];
                }
            }
        }
    }

    segmentNameSegmentDict[segmentName].rgbValues = newRGBValues;
    segmentNameSegmentRGBValuesDict[segmentName] = newRGBValues;

    if(!!segmentNameSegmentMeshDict[segmentName]) {
        segmentNameSegmentMeshDict[segmentName].material.color = new RC.Color(newRGBValues[0] / 255, newRGBValues[1] / 255, newRGBValues[2] / 255);
    }

    segmentationVolumeTexture.textureSubImage3D = new RC.TextureSubImage3D(
        0,
        0,
        0,
        0,
        textureWidth,
        textureHeight,
        textureDepth,
        RC.Texture.RGB,
        RC.Texture.FLOAT,
        segmentationVolumeTextureData
    );
}


function paint(canvasX, canvasY) {
    const viewWidth = canvas.width / 2;
    const viewHeight = canvas.height / 2;

    let viewX, viewY;
    let viewDecimalX, viewDecimalY;
    let textureSubImageOffsetX, textureSubImageOffsetY, textureSubImageOffsetZ;
    let textureSubImageWidth, textureSubImageHeight, textureSubImageDepth;

    if (0 < canvasX && canvasX < viewWidth && 0 < canvasY && canvasY < viewHeight) {
        // 2DX
        viewX = canvasX;
        viewY = canvasY;

        viewDecimalX = viewX / viewWidth;
        viewDecimalY = viewY / viewHeight;

        const currentTextureSubImageHeight = textureHeight * uvwScale2DX[1];
        const currentTextureSubImageDepth = textureDepth * uvwScale2DX[2];

        const currentTextureSubImageOffsetY = textureHeight * uvwTranslation2DX[1];
        const currentTextureSubImageOffsetZ = textureDepth * uvwTranslation2DX[2];

        textureSubImageOffsetX = guiData.sliceIndexX;
        textureSubImageOffsetY = currentTextureSubImageOffsetY + viewDecimalY * currentTextureSubImageHeight - (paintStrokeSize / 2);
        textureSubImageOffsetZ = currentTextureSubImageOffsetZ + (1 - viewDecimalX) * currentTextureSubImageDepth - (paintStrokeSize / 2);

        textureSubImageWidth = 1;
        textureSubImageHeight = paintStrokeSize;
        textureSubImageDepth = paintStrokeSize;

    } else if (0 < canvasX && canvasX < viewWidth && viewHeight < canvasY && canvasY < canvas.height) {
        // 2DY
        viewX = canvasX;
        viewY = canvasY - viewHeight;

        viewDecimalX = viewX / viewWidth;
        viewDecimalY = viewY / viewHeight;

        const currentTextureSubImageWidth = textureWidth * uvwScale2DY[0];
        const currentTextureSubImageDepth = textureDepth * uvwScale2DY[2];

        const currentTextureSubImageOffsetX = textureWidth * uvwTranslation2DY[0];
        const currentTextureSubImageOffsetZ = textureDepth * uvwTranslation2DY[2];

        textureSubImageOffsetX = currentTextureSubImageOffsetX + viewDecimalX * currentTextureSubImageWidth - (paintStrokeSize / 2);
        textureSubImageOffsetY = (textureHeight - 1) - guiData.sliceIndexY;
        textureSubImageOffsetZ = currentTextureSubImageOffsetZ + viewDecimalY * currentTextureSubImageDepth - (paintStrokeSize / 2);

        textureSubImageWidth = paintStrokeSize;
        textureSubImageHeight = 1;
        textureSubImageDepth = paintStrokeSize;

    } else if (viewWidth < canvasX && canvasX < canvas.width && 0 < canvasY && canvasY < viewHeight) {
        // 2DZ
        viewX = canvasX - viewWidth;
        viewY = canvasY;

        viewDecimalX = viewX / viewWidth;
        viewDecimalY = viewY / viewHeight;

        const currentTextureSubImageWidth = textureWidth * uvwScale2DZ[0];
        const currentTextureSubImageHeight = textureHeight * uvwScale2DZ[1];

        const currentTextureSubImageOffsetX = textureWidth * uvwTranslation2DZ[0];
        const currentTextureSubImageOffsetY = textureHeight * uvwTranslation2DZ[1];

        textureSubImageOffsetX = currentTextureSubImageOffsetX + viewDecimalX * currentTextureSubImageWidth - (paintStrokeSize / 2);
        textureSubImageOffsetY = currentTextureSubImageOffsetY + viewDecimalY * currentTextureSubImageHeight - (paintStrokeSize / 2);
        textureSubImageOffsetZ = guiData.sliceIndexZ;

        textureSubImageWidth = paintStrokeSize;
        textureSubImageHeight = paintStrokeSize;
        textureSubImageDepth = 1;

    } else {
        return;
    }

    textureSubImageOffsetX = Math.round(textureSubImageOffsetX);
    textureSubImageOffsetY = Math.round(textureSubImageOffsetY);
    textureSubImageOffsetZ = Math.round(textureSubImageOffsetZ);


    if (textureSubImageOffsetX < 0 || textureWidth < textureSubImageOffsetX + textureSubImageWidth) {
        return;
    }
    if (textureSubImageOffsetY < 0 || textureHeight < textureSubImageOffsetY + textureSubImageHeight) {
        return;
    }
    if (textureSubImageOffsetZ < 0 || textureDepth < textureSubImageOffsetZ + textureSubImageDepth) {
        return;
    }


    const paintData = new Float32Array(paintStrokeSize * paintStrokeSize * 3);
    const x1 = paintStrokeSize / 2;
    const y1 = paintStrokeSize / 2;
    const r = paintStrokeSize / 2;
    for (let i = 0; i < paintStrokeSize; ++i) {
        for (let j = 0; j < paintStrokeSize; ++j) {

            const x2 = i + 0.5;
            const y2 = j + 0.5;
            const a = x1 - x2;
            const b = y1 - y2;
            const c = Math.sqrt(a * a + b * b);
            const RGBValues = c <= r ? paintRGBValues : defaultSegmentRGBValues;

            const index = (j + i * paintStrokeSize) * 3;
            paintData[index + 0] = RGBValues[0];
            paintData[index + 1] = RGBValues[1];
            paintData[index + 2] = RGBValues[2];
        }
    }


    let paintVoxelIndex = 0;
    for (let z = textureSubImageOffsetZ; z < textureSubImageOffsetZ + textureSubImageDepth; ++z) {
        for (let y = textureSubImageOffsetY; y < textureSubImageOffsetY + textureSubImageHeight; ++y) {
            for (let x = textureSubImageOffsetX; x < textureSubImageOffsetX + textureSubImageWidth; ++x) {

                let index = x + y * textureWidth + z * textureWidth * textureHeight;
                let segmentationVoxelIndex = index * 3;

                let paintVoxelRGBValues = [
                    paintData[paintVoxelIndex + 0],
                    paintData[paintVoxelIndex + 1],
                    paintData[paintVoxelIndex + 2]
                ];

                let segmentationVoxelRGBValues = [
                    segmentationVolumeTextureData[segmentationVoxelIndex + 0],
                    segmentationVolumeTextureData[segmentationVoxelIndex + 1],
                    segmentationVolumeTextureData[segmentationVoxelIndex + 2]
                ];


                if (!areRGBValuesSame(paintVoxelRGBValues, defaultSegmentRGBValues)) {
                    if (areRGBValuesSame(paintVoxelRGBValues, eraserRGBValues)) {
                        if (areRGBValuesSame(segmentationVoxelRGBValues, segmentNameSegmentDict[guiData.segmentName].rgbValues)) {
                            segmentNameSegmentBinaryDataDict[guiData.segmentName][index] = 0;
                            segmentationVolumeLabelData[index] = defaultSegmentLabel;

                            segmentationVolumeTextureData[segmentationVoxelIndex + 0] = defaultSegmentRGBValues[0];
                            segmentationVolumeTextureData[segmentationVoxelIndex + 1] = defaultSegmentRGBValues[1];
                            segmentationVolumeTextureData[segmentationVoxelIndex + 2] = defaultSegmentRGBValues[2];
                        } else {
                            paintData[paintVoxelIndex + 0] = segmentationVoxelRGBValues[0];
                            paintData[paintVoxelIndex + 1] = segmentationVoxelRGBValues[1];
                            paintData[paintVoxelIndex + 2] = segmentationVoxelRGBValues[2];
                        }
                    } else {
                        const foundSegment = segmentLabelSegmentDict[segmentationVolumeLabelData[index]];
                        if (foundSegment) {
                            segmentNameSegmentBinaryDataDict[foundSegment.name][index] = 0;
                            segmentationVolumeLabelData[index] = defaultSegmentLabel;
                        }

                        segmentNameSegmentBinaryDataDict[guiData.segmentName][index] = 1;
                        segmentationVolumeLabelData[index] = segmentNameSegmentDict[guiData.segmentName].label;

                        segmentationVolumeTextureData[segmentationVoxelIndex + 0] = paintVoxelRGBValues[0];
                        segmentationVolumeTextureData[segmentationVoxelIndex + 1] = paintVoxelRGBValues[1];
                        segmentationVolumeTextureData[segmentationVoxelIndex + 2] = paintVoxelRGBValues[2];
                    }
                }

                if (areRGBValuesSame(paintVoxelRGBValues, defaultSegmentRGBValues)) {
                    paintData[paintVoxelIndex + 0] = segmentationVoxelRGBValues[0];
                    paintData[paintVoxelIndex + 1] = segmentationVoxelRGBValues[1];
                    paintData[paintVoxelIndex + 2] = segmentationVoxelRGBValues[2];
                }

                paintVoxelIndex += 3;
            }
        }
    }

    segmentationVolumeTexture.textureSubImage3D = new RC.TextureSubImage3D(
        0,
        textureSubImageOffsetX,
        textureSubImageOffsetY,
        textureSubImageOffsetZ,
        textureSubImageWidth,
        textureSubImageHeight,
        textureSubImageDepth,
        RC.Texture.RGB,
        RC.Texture.FLOAT,
        paintData
    );
}


function findSegmentByRGBValues(rgbValues) {
    let foundSegment = null;

    for (let i = 0; i < guiData.segmentNames.length; i++) {
        let segmentName = guiData.segmentNames[i];
        let segment = segmentNameSegmentDict[segmentName];
        let segmentRGBValues = segment.rgbValues;
        if (areRGBValuesSame(segmentRGBValues, rgbValues)) {
            foundSegment = segment;
            break;
        }
    }
    return foundSegment;
}


function autoSegmentation() {
    console.log('Auto segmentation start');

    const segment = segmentNameSegmentDict[guiData.segmentName];

    if (!segment) {
        return;
    }

    if (guiData.autoSegmentationStartSliceIndex >= guiData.autoSegmentationEndSliceIndex) {
        return;
    }

    const intermediateSliceCount = guiData.autoSegmentationEndSliceIndex - guiData.autoSegmentationStartSliceIndex - 1;

    if (intermediateSliceCount <= 0) {
        return;
    }

    const binaryMaskThreshold = 0.5;

    const segmentBinaryData = segmentNameSegmentBinaryDataDict[segment.name];

    if (guiData.autoSegmentationAxis === 'x') {
        for (let z = 0; z < textureDepth; z++) {
            for (let y = 0; y < textureHeight; y++) {
                const startSliceVoxelIndex = guiData.autoSegmentationStartSliceIndex + y * textureWidth + z * textureWidth * textureHeight;
                const endSliceVoxelIndex = guiData.autoSegmentationEndSliceIndex + y * textureWidth + z * textureWidth * textureHeight;

                const startSliceBinaryMaskVoxelValue = segmentBinaryData[startSliceVoxelIndex];
                const endSliceBinaryMaskVoxelValue = segmentBinaryData[endSliceVoxelIndex];
                const delta = (endSliceBinaryMaskVoxelValue - startSliceBinaryMaskVoxelValue) / (intermediateSliceCount + 1);
                let intermediateSliceIndex = guiData.autoSegmentationStartSliceIndex + 1;

                for (let x = intermediateSliceIndex; x < guiData.autoSegmentationEndSliceIndex; x++) {
                    const intermediateSliceVoxelIndex = x + y * textureWidth + z * textureWidth * textureHeight;
                    const segmentationVoxelIndex = intermediateSliceVoxelIndex * 3;

                    let intermediateSliceBinaryMaskVoxelValue = startSliceBinaryMaskVoxelValue + delta * (x - guiData.autoSegmentationStartSliceIndex);
                    intermediateSliceBinaryMaskVoxelValue = intermediateSliceBinaryMaskVoxelValue >= binaryMaskThreshold ? 1.0 : 0.0;

                    if (intermediateSliceBinaryMaskVoxelValue === 0) {
                        continue;
                    }

                    const segmentationVoxelRGBValues = [
                        segmentationVolumeTextureData[segmentationVoxelIndex + 0],
                        segmentationVolumeTextureData[segmentationVoxelIndex + 1],
                        segmentationVolumeTextureData[segmentationVoxelIndex + 2]
                    ];

                    const foundSegment = segmentLabelSegmentDict[segmentationVolumeLabelData[intermediateSliceVoxelIndex]];
                    if (foundSegment) {
                        segmentNameSegmentBinaryDataDict[foundSegment.name][intermediateSliceVoxelIndex] = 0;
                        segmentationVolumeLabelData[intermediateSliceVoxelIndex] = 0;
                    }

                    segmentBinaryData[intermediateSliceVoxelIndex] = intermediateSliceBinaryMaskVoxelValue;
                    segmentationVolumeLabelData[intermediateSliceVoxelIndex] = segment.label;

                    segmentationVolumeTextureData[segmentationVoxelIndex + 0] = segment.rgbValues[0];
                    segmentationVolumeTextureData[segmentationVoxelIndex + 1] = segment.rgbValues[1];
                    segmentationVolumeTextureData[segmentationVoxelIndex + 2] = segment.rgbValues[2];
                }
            }
        }

    } else if (guiData.autoSegmentationAxis === 'y') {
        for (let z = 0; z < textureDepth; z++) {
            for (let x = 0; x < textureWidth; x++) {
                const startSliceVoxelIndex = x + (textureHeight - 1 - guiData.autoSegmentationStartSliceIndex) * textureWidth + z * textureWidth * textureHeight;
                const endSliceVoxelIndex = x + (textureHeight - 1 - guiData.autoSegmentationEndSliceIndex) * textureWidth + z * textureWidth * textureHeight;

                const startSliceBinaryMaskVoxelValue = segmentBinaryData[startSliceVoxelIndex];
                const endSliceBinaryMaskVoxelValue = segmentBinaryData[endSliceVoxelIndex];
                const delta = (endSliceBinaryMaskVoxelValue - startSliceBinaryMaskVoxelValue) / (intermediateSliceCount + 1);
                let intermediateSliceIndex = guiData.autoSegmentationStartSliceIndex + 1;

                for (let y = intermediateSliceIndex; y < guiData.autoSegmentationEndSliceIndex; y++) {
                    const intermediateSliceVoxelIndex = x + (textureHeight - 1 - y) * textureWidth + z * textureWidth * textureHeight;
                    const segmentationVoxelIndex = intermediateSliceVoxelIndex * 3;

                    let intermediateSliceBinaryMaskVoxelValue = startSliceBinaryMaskVoxelValue + delta * (y - guiData.autoSegmentationStartSliceIndex);
                    intermediateSliceBinaryMaskVoxelValue = intermediateSliceBinaryMaskVoxelValue >= binaryMaskThreshold ? 1.0 : 0.0;

                    if (intermediateSliceBinaryMaskVoxelValue === 0) {
                        continue;
                    }

                    const segmentationVoxelRGBValues = [
                        segmentationVolumeTextureData[segmentationVoxelIndex + 0],
                        segmentationVolumeTextureData[segmentationVoxelIndex + 1],
                        segmentationVolumeTextureData[segmentationVoxelIndex + 2]
                    ];

                    const foundSegment = segmentLabelSegmentDict[segmentationVolumeLabelData[intermediateSliceVoxelIndex]];
                    if (foundSegment) {
                        segmentNameSegmentBinaryDataDict[foundSegment.name][intermediateSliceVoxelIndex] = 0;
                        segmentationVolumeLabelData[intermediateSliceVoxelIndex] = 0;
                    }

                    segmentBinaryData[intermediateSliceVoxelIndex] = intermediateSliceBinaryMaskVoxelValue;
                    segmentationVolumeLabelData[intermediateSliceVoxelIndex] = segment.label;

                    segmentationVolumeTextureData[segmentationVoxelIndex + 0] = segment.rgbValues[0];
                    segmentationVolumeTextureData[segmentationVoxelIndex + 1] = segment.rgbValues[1];
                    segmentationVolumeTextureData[segmentationVoxelIndex + 2] = segment.rgbValues[2];
                }
            }
        }


    } else if (guiData.autoSegmentationAxis === 'z') {
        for (let y = 0; y < textureHeight; y++) {
            for (let x = 0; x < textureWidth; x++) {
                const startSliceVoxelIndex = x + y * textureWidth + guiData.autoSegmentationStartSliceIndex * textureWidth * textureHeight;
                const endSliceVoxelIndex = x + y * textureWidth + guiData.autoSegmentationEndSliceIndex * textureWidth * textureHeight;

                const startSliceBinaryMaskVoxelValue = segmentBinaryData[startSliceVoxelIndex];
                const endSliceBinaryMaskVoxelValue = segmentBinaryData[endSliceVoxelIndex];
                const delta = (endSliceBinaryMaskVoxelValue - startSliceBinaryMaskVoxelValue) / (intermediateSliceCount + 1);
                let intermediateSliceIndex = guiData.autoSegmentationStartSliceIndex + 1;

                for (let z = intermediateSliceIndex; z < guiData.autoSegmentationEndSliceIndex; z++) {
                    const intermediateSliceVoxelIndex = x + y * textureWidth + z * textureWidth * textureHeight;
                    const segmentationVoxelIndex = intermediateSliceVoxelIndex * 3;

                    let intermediateSliceBinaryMaskVoxelValue = startSliceBinaryMaskVoxelValue + delta * (z - guiData.autoSegmentationStartSliceIndex);
                    intermediateSliceBinaryMaskVoxelValue = intermediateSliceBinaryMaskVoxelValue >= binaryMaskThreshold ? 1.0 : 0.0;

                    if (intermediateSliceBinaryMaskVoxelValue === 0) {
                        continue;
                    }

                    const segmentationVoxelRGBValues = [
                        segmentationVolumeTextureData[segmentationVoxelIndex + 0],
                        segmentationVolumeTextureData[segmentationVoxelIndex + 1],
                        segmentationVolumeTextureData[segmentationVoxelIndex + 2]
                    ];

                    const foundSegment = segmentLabelSegmentDict[segmentationVolumeLabelData[intermediateSliceVoxelIndex]];
                    if (foundSegment) {
                        segmentNameSegmentBinaryDataDict[foundSegment.name][intermediateSliceVoxelIndex] = 0;
                        segmentationVolumeLabelData[intermediateSliceVoxelIndex] = 0;
                    }

                    segmentBinaryData[intermediateSliceVoxelIndex] = intermediateSliceBinaryMaskVoxelValue;
                    segmentationVolumeLabelData[intermediateSliceVoxelIndex] = segment.label;

                    segmentationVolumeTextureData[segmentationVoxelIndex + 0] = segment.rgbValues[0];
                    segmentationVolumeTextureData[segmentationVoxelIndex + 1] = segment.rgbValues[1];
                    segmentationVolumeTextureData[segmentationVoxelIndex + 2] = segment.rgbValues[2];
                }
            }
        }

    } else {
        return;
    }

    segmentationVolumeTexture.textureSubImage3D = new RC.TextureSubImage3D(
        0,
        0,
        0,
        0,
        textureWidth,
        textureHeight,
        textureDepth,
        RC.Texture.RGB,
        RC.Texture.FLOAT,
        new Float32Array(segmentationVolumeTextureData)
    );

    console.log('Auto segmentation end');
}


function marchingCubes(values) {

    const dimensions = {
        x: textureWidth,
        y: textureHeight,
        z: textureDepth
    };

    const maxDimension = Math.max(textureWidth, textureHeight, textureDepth);

    const voxelDimensions = {
        x: maxDimension / textureWidth,
        y: maxDimension / textureHeight,
        z: maxDimension / textureDepth
    };

    const isoValue = 0.5;

    const meta = {
        dimensions: dimensions,
        voxelDimensions: voxelDimensions,
        isoLevel: isoValue
    };

    const [vertices, indices] = marchingCubesWorker.calculateVerticesAndIndices(meta, values);

    console.log('vertices', vertices.length / 3);
    console.log('indices', indices.length);

    return {
        "vertices": vertices,
        "indices": indices
    };
}


function showSelectedSegmentMesh() {
    if (!guiData.segmentName) {
        return;
    }
    constructSegmentMesh(guiData.segmentName);
}


function showAllSegmentMeshes() {
    const n = guiData.segmentNames.length;
    for (let i=0; i<n; i++) {
        console.log('Segment ' + i + '/' + n);
        const segmentName = guiData.segmentNames[i];
        constructSegmentMesh(segmentName);
    }
}


function constructSegmentMesh(segmentName) {
    console.log('Starting construct mesh for segment ' + segmentName);

    if (!!segmentNameSegmentMeshDict[segmentName]) {
        scene3D.remove(segmentNameSegmentMeshDict[segmentName]);
        delete segmentNameSegmentMeshDict[name];
    }

    const segmentRGBValues = segmentNameSegmentRGBValuesDict[segmentName];
    const segmentBinaryData = segmentNameSegmentBinaryDataDict[segmentName];
    const marchingCubesValues = marchingCubes(segmentBinaryData);

    // segment mesh
    let material = new RC.MeshPhongMaterial();
    material.color = new RC.Color(segmentRGBValues[0] / 255, segmentRGBValues[1] / 255, segmentRGBValues[2] / 255);
    material.side = RC.FRONT_AND_BACK_SIDE;
    material.shininess = 10;

    let geometry = new Geometry();
    geometry.vertices = Float32Attribute([], 3);
    geometry.indices = Uint32Attribute([], 1);
    geometry.computeVertexNormals();

    let segmentMesh = new RC.Mesh(geometry, material);
    segmentMesh.geometry.vertices = Float32Attribute(marchingCubesValues.vertices, 3);
    segmentMesh.geometry.indices = Uint32Attribute(marchingCubesValues.indices, 1);
    segmentMesh.geometry.computeVertexNormals();

    scene3D.add(segmentMesh);
    segmentNameSegmentMeshDict[segmentName] = segmentMesh;

    console.log('Ending construct mesh for segment ' + segmentName);
}


function hideSelectedSegmentMesh() {
    if (!guiData.segmentName) {
        return;
    }
    const segmentName = guiData.segmentName;
    scene3D.remove(segmentNameSegmentMeshDict[segmentName]);
    delete segmentNameSegmentMeshDict[name];
}


function hideAllSegmentMeshes() {
    const n = guiData.segmentNames.length;
    for (let i=0; i<n; i++) {
        console.log('Segment ' + i + '/' + n);
        const segmentName = guiData.segmentNames[i];
        scene3D.remove(segmentNameSegmentMeshDict[segmentName]);
        delete segmentNameSegmentMeshDict[name];
    }
}


function loading(message, callback) {
    loaderMessage.innerHTML = message;
    loaderOverlay.style.display = 'block';

    setTimeout(
        function () {
            callback();
            loaderOverlay.style.display = 'none';
        },
        50
    );
}


function getNewLabel() {
    if (segmentLabels.length === 0) {
        return 1;
    }

    const maxLabel = Math.max(...segmentLabels);
    let newLabel = maxLabel + 1;
    for(let i=1; i<maxLabel; i++) {
        if (!segmentLabels.includes(i)) {
            newLabel = i;
            break;
        }
    }
    return newLabel;
}


function calculatePaintStrokeSvgCursorParams(width, height) {
    paintStrokeSvgCursorParams.width = width;
    paintStrokeSvgCursorParams.height = height;
    paintStrokeSvgCursorParams.cx = width / 2;
    paintStrokeSvgCursorParams.cy = height / 2;
    paintStrokeSvgCursorParams.rx = width / 2 - paintStrokeSvgCursorParams.strokeWidth;
    paintStrokeSvgCursorParams.ry = height / 2 - paintStrokeSvgCursorParams.strokeWidth;
}


function setPaintStrokeSvgCursor(canvasX, canvasY) {
    const viewWidth = canvas.width / 2;
    const viewHeight = canvas.height / 2;

    let cursorWidth, cursorHeight;

    if (0 < canvasX && canvasX < viewWidth && 0 < canvasY && canvasY < viewHeight) {
        // 2DX
        cursorWidth = (viewWidth / (textureDepth * uvwScale2DX[2])) * paintStrokeSize;
        cursorHeight = (viewHeight / (textureHeight * uvwScale2DX[1])) * paintStrokeSize;

    } else if (0 < canvasX && canvasX < viewWidth && viewHeight < canvasY && canvasY < canvas.height) {
        // 2DY
        cursorWidth = (viewWidth / (textureWidth * uvwScale2DY[0])) * paintStrokeSize;
        cursorHeight = (viewHeight / (textureDepth * uvwScale2DY[2])) * paintStrokeSize;

    } else if (viewWidth < canvasX && canvasX < canvas.width && 0 < canvasY && canvasY < viewHeight) {
        // 2DZ
        cursorWidth = (viewWidth / (textureWidth * uvwScale2DZ[0])) * paintStrokeSize;
        cursorHeight = (viewHeight / (textureHeight * uvwScale2DZ[1])) * paintStrokeSize;

    } else {
        return;
    }

    if (paintStrokeSvgCursorParams.width === cursorWidth && paintStrokeSvgCursorParams.height === cursorHeight) {
        return;
    }

    calculatePaintStrokeSvgCursorParams(cursorWidth, cursorHeight);
    canvas.style.cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='${paintStrokeSvgCursorParams.height}' width='${paintStrokeSvgCursorParams.width}'%3E%3Cellipse cx='${paintStrokeSvgCursorParams.cx}' cy='${paintStrokeSvgCursorParams.cy}' rx='${paintStrokeSvgCursorParams.rx}' ry='${paintStrokeSvgCursorParams.ry}' stroke='black' stroke-width='${paintStrokeSvgCursorParams.strokeWidth}' fill='black' fill-opacity='0.0'/%3E%3C/svg%3E%0A") ${paintStrokeSvgCursorParams.cx} ${paintStrokeSvgCursorParams.cy}, auto`;
}

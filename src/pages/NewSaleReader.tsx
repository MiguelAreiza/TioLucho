import { useEffect, useState } from 'react';
import QrReader from 'react-qr-scanner';

// Components
import { useAppStates } from '../helpers/states';
import { Header } from '../components/Header';

function NewSaleReader() {
    const { setIsLoading, setMenuConfig } = useAppStates();
    const [result, setResult] = useState(null);
    
    const [cameraId, setCameraId] = useState('');
    const [devices, setDevices] = useState<Array<MediaDeviceInfo>>([]);
    const [loadingDevices, setLoadingDevices] = useState(true);

    useEffect(() => {
        selectCamera();
        
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#F2A819');
        document.querySelector('meta[name="background-color"]')?.setAttribute('content', '#F2A819');
        setMenuConfig({
            tabOption: 'sale'
        });

        setTimeout(() => {
            setIsLoading(false);
        }, 300);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectCamera = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter((device) => device.kind === 'videoinput');
            setDevices(videoDevices);

            if (videoDevices.length > 1) {
                setCameraId(videoDevices[1].deviceId);
            } else if (videoDevices.length > 0) {
                setCameraId(videoDevices[0].deviceId);
            }
        } catch (error) {
            console.error('Error al obtener los dispositivos de video:', error);
        } finally {
            setLoadingDevices(false);
        }
    };

    const handleCameraChange = (event: any) => {
        const selectedCameraId = event.target.value;
        setCameraId(selectedCameraId);
    };
    

    const handleScan = (data: any) => {
        if (data) {
            setResult(data.text);
        }
    };

    const handleError = (err: any) => {
        console.error(err);
    };

    return (
        <div className='container_qr_reader'>
            <Header />
            <h3>Lector de clientes</h3>

            <div className='device_selector'>
                { loadingDevices ? <p>Cargando dispositivos...</p>
                :
                    <select value={cameraId} onChange={handleCameraChange}>
                        {devices.map((device) => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Cámara ${device.deviceId}`}
                            </option>
                        ))}
                    </select>
                }                
            </div>
            
            <QrReader
                className='qrReader'
                delay={500}
                onError={handleError}
                onScan={handleScan}
                constraints={cameraId && { audio: false, video: { deviceId: cameraId } }}
            />
            {result && <p>Resultado: {result}</p>}
        </div>
    );
}

export { NewSaleReader };
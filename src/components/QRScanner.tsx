import React, { useRef, useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload, Hash, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface QRScannerProps {
  onScan: (ticketId: string) => void;
  onClose?: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState('');
  const [activeTab, setActiveTab] = useState('camera');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startCameraScan = async () => {
    try {
      // Stop any existing scanner first
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
        scannerRef.current = null;
      }

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          try {
            onScan(decodedText);
            stopScanning();
          } catch (error) {
            console.error('Error in scan callback:', error);
            stopScanning();
          }
        },
        (errorMessage) => {
          // Ignore scanning errors (normal during scanning)
        }
      );
      setScanning(true);
    } catch (err) {
      console.error('Camera scan error:', err);
      setScanning(false);
      alert('Could not access camera. Please check permissions or try uploading an image instead.');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Stop scan error:', err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const scanner = new Html5Qrcode('qr-reader');
      const result = await scanner.scanFile(file, false);
      try {
        onScan(result);
      } catch (error) {
        console.error('Error in scan callback:', error);
      }
      // Clean up
      try {
        scanner.clear();
      } catch (e) {
        // Ignore cleanup errors
      }
    } catch (err: any) {
      console.error('File scan error:', err);
      alert('Could not read QR code from image. Please try another image or enter the ticket ID manually.');
    } finally {
      // Reset file input
      event.target.value = '';
    }
  };

  const handleManualSubmit = () => {
    if (manualId.trim()) {
      try {
        onScan(manualId.trim());
        setManualId('');
      } catch (error) {
        console.error('Error in manual submit:', error);
        alert('An error occurred. Please try again.');
      }
    }
  };

  return (
    <Card className="glass-card border-primary/30 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-xl gradient-text-primary">Scan Your Ticket</CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/10 hover:text-destructive">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50 border border-border/50">
            <TabsTrigger value="camera" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Camera className="w-4 h-4" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Hash className="w-4 h-4" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="space-y-4">
            <div id="qr-reader" className="w-full aspect-square rounded-lg overflow-hidden bg-secondary border border-border/50" />
            {!scanning ? (
              <Button onClick={startCameraScan} className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg" variant="default">
                <Camera className="w-4 h-4 mr-2" />
                Start Camera Scan
              </Button>
            ) : (
              <Button onClick={stopScanning} className="w-full bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 shadow-lg" variant="destructive">
                Stop Scanning
              </Button>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload a QR code image
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="qr-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('qr-upload')?.click()}
              >
                Choose File
              </Button>
            </div>
            <div id="qr-reader" className="hidden" />
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter Ticket ID</label>
              <Input
                type="text"
                placeholder="e.g., TKT-12345-ABCD"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
              />
            </div>
            <Button onClick={handleManualSubmit} className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg disabled:opacity-50" disabled={!manualId.trim()}>
              <Hash className="w-4 h-4 mr-2" />
              Submit Ticket ID
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QRScanner;


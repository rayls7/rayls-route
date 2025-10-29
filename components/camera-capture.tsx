"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, X, RotateCcw } from "lucide-react"

interface CameraCaptureProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (photoDataUrl: string) => void
  title: string
}

export function CameraCapture({ open, onOpenChange, onCapture, title }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1920, height: 1080 },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Erro ao acessar câmera:", error)
      alert("Não foi possível acessar a câmera. Verifique as permissões.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
        setCapturedPhoto(dataUrl)
        stopCamera()
      }
    }
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
    startCamera()
  }

  const confirmPhoto = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto)
      setCapturedPhoto(null)
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    stopCamera()
    setCapturedPhoto(null)
    onOpenChange(false)
  }

  // Start camera when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && !stream && !capturedPhoto) {
      startCamera()
    } else if (!isOpen) {
      handleClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!capturedPhoto ? (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
            <div className="relative bg-black rounded-lg overflow-hidden">
              <img src={capturedPhoto || "/placeholder.svg"} alt="Foto capturada" className="w-full h-auto" />
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Camera className="h-4 w-4" />
            <p>Tire uma foto clara do painel do motor</p>
          </div>
        </div>

        <DialogFooter>
          {!capturedPhoto ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={capturePhoto} disabled={!stream}>
                <Camera className="h-4 w-4 mr-2" />
                Capturar Foto
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={retakePhoto}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Tirar Novamente
              </Button>
              <Button onClick={confirmPhoto}>Confirmar Foto</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

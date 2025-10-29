"use client"

import jsPDF from "jspdf"
import type { Route } from "./types"

export async function generateRoutePDF(route: Route): Promise<void> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Header
  pdf.setFontSize(20)
  pdf.setFont("helvetica", "bold")
  pdf.text("Relatório de Rota", margin, yPosition)
  yPosition += 10

  // Route summary
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")
  pdf.text(
    `Data: ${new Date(route.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`,
    margin,
    yPosition,
  )
  yPosition += 7
  pdf.text(`Total de Visitas: ${route.visits.length}`, margin, yPosition)
  yPosition += 7
  pdf.text(`Quilometragem Total: ${route.totalKm.toFixed(1)} km`, margin, yPosition)
  yPosition += 12

  // Visits
  for (let i = 0; i < route.visits.length; i++) {
    const visit = route.visits[i]

    checkNewPage(40)

    // Visit header
    pdf.setFillColor(240, 240, 240)
    pdf.rect(margin, yPosition - 5, contentWidth, 10, "F")
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text(`Visita ${i + 1}: ${visit.addressName}`, margin + 2, yPosition)
    yPosition += 10

    // Visit details
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Endereço: ${visit.address}`, margin + 2, yPosition)
    yPosition += 6

    if (visit.startTime && visit.endTime) {
      pdf.text(
        `Horário: ${visit.startTime.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${visit.endTime.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        margin + 2,
        yPosition,
      )
      yPosition += 6
    }

    const kmTraveled = (visit.endKm || 0) - (visit.startKm || 0)
    pdf.text(
      `Quilometragem: ${visit.startKm} km → ${visit.endKm} km (${kmTraveled.toFixed(1)} km)`,
      margin + 2,
      yPosition,
    )
    yPosition += 6

    if (visit.startLat && visit.startLng) {
      pdf.text(`GPS Inicial: ${visit.startLat.toFixed(6)}, ${visit.startLng.toFixed(6)}`, margin + 2, yPosition)
      yPosition += 6
    }

    if (visit.endLat && visit.endLng) {
      pdf.text(`GPS Final: ${visit.endLat.toFixed(6)}, ${visit.endLng.toFixed(6)}`, margin + 2, yPosition)
      yPosition += 6
    }

    yPosition += 5

    // Photos
    const photoWidth = (contentWidth - 5) / 2
    const photoHeight = photoWidth * 0.75

    checkNewPage(photoHeight + 15)

    if (visit.startPhoto || visit.endPhoto) {
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      pdf.text("Fotos do Motor:", margin + 2, yPosition)
      yPosition += 7

      const startX = margin + 2

      if (visit.startPhoto) {
        try {
          pdf.addImage(visit.startPhoto, "JPEG", startX, yPosition, photoWidth, photoHeight)
          pdf.setFontSize(8)
          pdf.setFont("helvetica", "normal")
          pdf.text("Foto Inicial", startX, yPosition + photoHeight + 4)
        } catch (error) {
          console.error("Erro ao adicionar foto inicial:", error)
        }
      }

      if (visit.endPhoto) {
        try {
          pdf.addImage(visit.endPhoto, "JPEG", startX + photoWidth + 5, yPosition, photoWidth, photoHeight)
          pdf.setFontSize(8)
          pdf.setFont("helvetica", "normal")
          pdf.text("Foto Final", startX + photoWidth + 5, yPosition + photoHeight + 4)
        } catch (error) {
          console.error("Erro ao adicionar foto final:", error)
        }
      }

      yPosition += photoHeight + 10
    }

    yPosition += 5
  }

  // Footer on last page
  pdf.setFontSize(8)
  pdf.setFont("helvetica", "italic")
  pdf.text(`Gerado em ${new Date().toLocaleString("pt-BR")} - RouteTracker`, margin, pageHeight - 10)

  // Save PDF
  const fileName = `rota-${new Date(route.date).toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`
  pdf.save(fileName)
}

// Simplified base editor (can be extended)
import React, { useRef, useState } from 'react';
import { Stage, Layer, Text, Transformer, Image as KonvaImage } from 'react-konva';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import useImage from 'use-image';

const inchToPx = 300;
const canvasWidth = 22 * inchToPx;
const canvasHeight = 39 * inchToPx;

function DtfImage({ src, x, y, width, height, isSelected, onSelect, onChange }) {
  const [image] = useImage(src);
  const shapeRef = useRef();
  const trRef = useRef();

  return (
    <>
      <KonvaImage
        image={image}
        x={x}
        y={y}
        width={width}
        height={height}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        onDragEnd={e => {
          onChange({ x: e.target.x(), y: e.target.y() });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          nodes={[shapeRef.current]}
          boundBoxFunc={(oldBox, newBox) => newBox}
        />
      )}
    </>
  );
}

export default function DtfEditor() {
  const stageRef = useRef();
  const [images, setImages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const handleExportPNG = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = 'gangsheet.png';
    link.href = uri;
    link.click();
  };

  const handleExportPDF = async () => {
    const canvas = stageRef.current.toCanvas();
    const dataUrl = canvas.toDataURL();
    const pdf = new jsPDF({ unit: 'px', format: [canvasWidth, canvasHeight] });
    pdf.addImage(dataUrl, 'PNG', 0, 0);
    pdf.save('gangsheet.pdf');
  };

  const handleFileChange = e => {
    const files = e.target.files;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      setImages(imgs => [
        ...imgs,
        {
          id: Date.now().toString(),
          src: url,
          x: 50,
          y: 50,
          width: 300,
          height: 300
        }
      ]);
    });
  };

  return (
    <div>
      <div style={{ padding: 10 }}>
        <input type="file" multiple onChange={handleFileChange} />
        <button onClick={handleExportPNG}>Export PNG</button>
        <button onClick={handleExportPDF}>Export PDF</button>
      </div>
      <Stage width={window.innerWidth} height={window.innerHeight - 80} ref={stageRef}>
        <Layer>
          {images.map((img, i) => (
            <DtfImage
              key={img.id}
              {...img}
              isSelected={img.id === selectedId}
              onSelect={() => setSelectedId(img.id)}
              onChange={newAttrs => {
                const newImages = [...images];
                newImages[i] = { ...newImages[i], ...newAttrs };
                setImages(newImages);
              }}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

import React from "react";
import {
  useWhiteboard,
  type DrawTool,
  type DrawAction,
} from "@/hooks/useWhiteboard";
import {
  Pencil,
  Eraser,
  Minus,
  Square,
  Circle,
  Type,
  Undo2,
  Redo2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface CollaborativeWhiteboardProps {
  onDraw?: (action: DrawAction) => void;
  onRemoteDraw?: (action: DrawAction) => void;
  disabled?: boolean;
  className?: string;
}

export interface CollaborativeWhiteboardHandle {
  drawRemoteAction: (action: DrawAction) => void;
}

const COLORS = [
  "#000000", // Black
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#800080", // Purple
  "#FFFFFF", // White
];

const TOOLS: { tool: DrawTool; icon: React.ReactNode; label: string }[] = [
  { tool: "pen", icon: <Pencil className="w-4 h-4" />, label: "Pen" },
  { tool: "eraser", icon: <Eraser className="w-4 h-4" />, label: "Eraser" },
  { tool: "line", icon: <Minus className="w-4 h-4" />, label: "Line" },
  {
    tool: "rectangle",
    icon: <Square className="w-4 h-4" />,
    label: "Rectangle",
  },
  { tool: "circle", icon: <Circle className="w-4 h-4" />, label: "Circle" },
  {
    tool: "text",
    icon: <Type className="w-4 h-4" />,
    label: "Text (Coming Soon)",
  },
];

export const CollaborativeWhiteboard = React.forwardRef<
  CollaborativeWhiteboardHandle,
  CollaborativeWhiteboardProps
>(({ onDraw, disabled = false, className = "" }, ref) => {
  const {
    canvasRef,
    tool,
    setTool,
    color,
    setColor,
    size,
    setSize,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
    drawRemoteAction,
  } = useWhiteboard({ onDraw, width: 1200, height: 800 });

  // Expose drawRemoteAction to whoever holds the forwarded ref (e.g. the
  // live-classroom page, which feeds it incoming socket events).
  React.useImperativeHandle(ref, () => ({ drawRemoteAction }), [drawRemoteAction]);

  return (
    <div className={`flex flex-col bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-wrap">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-3">
          {TOOLS.map(({ tool: t, icon, label }) => (
            <Button
              key={t}
              variant={tool === t ? "default" : "ghost"}
              size="sm"
              onClick={() => setTool(t)}
              disabled={disabled || t === "text"}
              title={label}
              className="w-9 h-9 p-0"
            >
              {icon}
            </Button>
          ))}
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-3">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              disabled={disabled}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                color === c
                  ? "border-violet-500 dark:border-violet-400 scale-110"
                  : "border-gray-300 dark:border-gray-600 hover:scale-105"
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-2 border-r border-gray-300 dark:border-gray-600 pr-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Size:
          </span>
          <Slider
            value={[size]}
            onValueChange={(values) => setSize(values[0])}
            min={1}
            max={20}
            step={1}
            disabled={disabled}
            className="w-24"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-6">
            {size}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo || disabled}
            title="Undo"
            className="w-9 h-9 p-0"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo || disabled}
            title="Redo"
            className="w-9 h-9 p-0"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            disabled={disabled}
            title="Clear Board"
            className="w-9 h-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {disabled && (
          <div className="ml-auto text-sm text-amber-600 dark:text-amber-400 font-medium">
            🔒 View Only
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 p-4">
        <div className="inline-block shadow-lg">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 dark:border-gray-600 rounded cursor-crosshair touch-none"
            style={{
              maxWidth: "100%",
              height: "auto",
              opacity: disabled ? 0.7 : 1,
            }}
          />
        </div>
      </div>
    </div>
  );
});

CollaborativeWhiteboard.displayName = "CollaborativeWhiteboard";

export default CollaborativeWhiteboard;

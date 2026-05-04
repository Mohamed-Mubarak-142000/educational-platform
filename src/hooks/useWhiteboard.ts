import { useEffect, useRef, useState, useCallback } from "react";

export type DrawTool =
  | "pen"
  | "eraser"
  | "line"
  | "rectangle"
  | "circle"
  | "text"
  | "select";

export interface DrawAction {
  tool: DrawTool;
  color: string;
  size: number;
  points?: { x: number; y: number }[];
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  text?: string;
  id: string;
}

interface UseWhiteboardOptions {
  onDraw?: (action: DrawAction) => void;
  width?: number;
  height?: number;
}

export const useWhiteboard = ({
  onDraw,
  width = 1200,
  height = 800,
}: UseWhiteboardOptions = {}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<DrawTool>("pen");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(2);
  const [history, setHistory] = useState<DrawAction[]>([]);
  const [historyStep, setHistoryStep] = useState(0);

  const currentAction = useRef<DrawAction | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.lineCap = "round";
    context.lineJoin = "round";
    contextRef.current = context;

    // Fill with white background
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }, [width, height]);

  // Get mouse/touch position
  const getPosition = useCallback(
    (e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      if ("touches" in e && e.touches.length > 0) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY,
        };
      } else if ("clientX" in e) {
        return {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        };
      }
      return null;
    },
    [],
  );

  // Start drawing
  const startDrawing = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const pos = getPosition(e);
      if (!pos) return;

      setIsDrawing(true);
      startPos.current = pos;

      const action: DrawAction = {
        tool,
        color,
        size,
        id: `${Date.now()}-${Math.random()}`,
        points: tool === "pen" || tool === "eraser" ? [pos] : undefined,
        startX: pos.x,
        startY: pos.y,
      };

      currentAction.current = action;

      if (tool === "pen" || tool === "eraser") {
        const context = contextRef.current;
        if (!context) return;

        context.beginPath();
        context.moveTo(pos.x, pos.y);
        context.strokeStyle = tool === "eraser" ? "#ffffff" : color;
        context.lineWidth = tool === "eraser" ? size * 2 : size;
      }
    },
    [tool, color, size, getPosition],
  );

  // Draw
  const draw = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDrawing || !currentAction.current) return;
      e.preventDefault();

      const pos = getPosition(e);
      if (!pos) return;

      const context = contextRef.current;
      if (!context) return;

      if (tool === "pen" || tool === "eraser") {
        // Freehand drawing
        context.lineTo(pos.x, pos.y);
        context.stroke();

        if (currentAction.current.points) {
          currentAction.current.points.push(pos);
        }
      } else if (tool === "line" || tool === "rectangle" || tool === "circle") {
        // Shape drawing - redraw from history and show preview
        redrawCanvas();

        context.strokeStyle = color;
        context.lineWidth = size;
        context.beginPath();

        if (tool === "line" && startPos.current) {
          context.moveTo(startPos.current.x, startPos.current.y);
          context.lineTo(pos.x, pos.y);
        } else if (tool === "rectangle" && startPos.current) {
          const width = pos.x - startPos.current.x;
          const height = pos.y - startPos.current.y;
          context.rect(startPos.current.x, startPos.current.y, width, height);
        } else if (tool === "circle" && startPos.current) {
          const radius = Math.sqrt(
            Math.pow(pos.x - startPos.current.x, 2) +
              Math.pow(pos.y - startPos.current.y, 2),
          );
          context.arc(
            startPos.current.x,
            startPos.current.y,
            radius,
            0,
            2 * Math.PI,
          );
        }

        context.stroke();

        currentAction.current.endX = pos.x;
        currentAction.current.endY = pos.y;
      }
    },
    [isDrawing, tool, color, size, getPosition],
  );

  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);

    if (currentAction.current) {
      // Add to history
      const newHistory = [
        ...history.slice(0, historyStep),
        currentAction.current,
      ];
      setHistory(newHistory);
      setHistoryStep(newHistory.length);

      // Emit to other users
      if (onDraw) {
        onDraw(currentAction.current);
      }
    }

    currentAction.current = null;
    startPos.current = null;
  }, [isDrawing, history, historyStep, onDraw]);

  // Redraw canvas from history
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // Clear canvas
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw all actions from history
    history.slice(0, historyStep).forEach((action) => {
      context.strokeStyle = action.tool === "eraser" ? "#ffffff" : action.color;
      context.lineWidth =
        action.tool === "eraser" ? action.size * 2 : action.size;
      context.beginPath();

      if (action.tool === "pen" || action.tool === "eraser") {
        if (action.points && action.points.length > 0) {
          context.moveTo(action.points[0].x, action.points[0].y);
          action.points.forEach((point) => {
            context.lineTo(point.x, point.y);
          });
          context.stroke();
        }
      } else if (
        action.tool === "line" &&
        action.startX !== undefined &&
        action.startY !== undefined &&
        action.endX !== undefined &&
        action.endY !== undefined
      ) {
        context.moveTo(action.startX, action.startY);
        context.lineTo(action.endX, action.endY);
        context.stroke();
      } else if (
        action.tool === "rectangle" &&
        action.startX !== undefined &&
        action.startY !== undefined &&
        action.endX !== undefined &&
        action.endY !== undefined
      ) {
        const width = action.endX - action.startX;
        const height = action.endY - action.startY;
        context.rect(action.startX, action.startY, width, height);
        context.stroke();
      } else if (
        action.tool === "circle" &&
        action.startX !== undefined &&
        action.startY !== undefined &&
        action.endX !== undefined &&
        action.endY !== undefined
      ) {
        const radius = Math.sqrt(
          Math.pow(action.endX - action.startX, 2) +
            Math.pow(action.endY - action.startY, 2),
        );
        context.arc(action.startX, action.startY, radius, 0, 2 * Math.PI);
        context.stroke();
      }
    });
  }, [history, historyStep]);

  // Draw action from remote user
  const drawRemoteAction = useCallback((action: DrawAction) => {
    const context = contextRef.current;
    if (!context) return;

    context.strokeStyle = action.tool === "eraser" ? "#ffffff" : action.color;
    context.lineWidth =
      action.tool === "eraser" ? action.size * 2 : action.size;
    context.beginPath();

    if (action.tool === "pen" || action.tool === "eraser") {
      if (action.points && action.points.length > 0) {
        context.moveTo(action.points[0].x, action.points[0].y);
        action.points.forEach((point) => {
          context.lineTo(point.x, point.y);
        });
        context.stroke();
      }
    } else if (
      action.tool === "line" &&
      action.startX !== undefined &&
      action.startY !== undefined &&
      action.endX !== undefined &&
      action.endY !== undefined
    ) {
      context.moveTo(action.startX, action.startY);
      context.lineTo(action.endX, action.endY);
      context.stroke();
    } else if (
      action.tool === "rectangle" &&
      action.startX !== undefined &&
      action.startY !== undefined &&
      action.endX !== undefined &&
      action.endY !== undefined
    ) {
      const width = action.endX - action.startX;
      const height = action.endY - action.startY;
      context.rect(action.startX, action.startY, width, height);
      context.stroke();
    } else if (
      action.tool === "circle" &&
      action.startX !== undefined &&
      action.startY !== undefined &&
      action.endX !== undefined &&
      action.endY !== undefined
    ) {
      const radius = Math.sqrt(
        Math.pow(action.endX - action.startX, 2) +
          Math.pow(action.endY - action.startY, 2),
      );
      context.arc(action.startX, action.startY, radius, 0, 2 * Math.PI);
      context.stroke();
    }

    // Add to history
    setHistory((prev) => [...prev, action]);
    setHistoryStep((prev) => prev + 1);
  }, []);

  // Undo
  const undo = useCallback(() => {
    if (historyStep > 0) {
      setHistoryStep((prev) => prev - 1);
      setTimeout(redrawCanvas, 0);
    }
  }, [historyStep, redrawCanvas]);

  // Redo
  const redo = useCallback(() => {
    if (historyStep < history.length) {
      setHistoryStep((prev) => prev + 1);
      setTimeout(redrawCanvas, 0);
    }
  }, [historyStep, history.length, redrawCanvas]);

  // Clear
  const clear = useCallback(() => {
    setHistory([]);
    setHistoryStep(0);
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Attach event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", startDrawing as any);
    canvas.addEventListener("mousemove", draw as any);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    canvas.addEventListener("touchstart", startDrawing as any);
    canvas.addEventListener("touchmove", draw as any);
    canvas.addEventListener("touchend", stopDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing as any);
      canvas.removeEventListener("mousemove", draw as any);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);

      canvas.removeEventListener("touchstart", startDrawing as any);
      canvas.removeEventListener("touchmove", draw as any);
      canvas.removeEventListener("touchend", stopDrawing);
    };
  }, [startDrawing, draw, stopDrawing]);

  return {
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
    canUndo: historyStep > 0,
    canRedo: historyStep < history.length,
    drawRemoteAction,
  };
};

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Cpu,
  Eye,
  Globe,
  HardDrive,
  Monitor,
  Network,
  RotateCcw,
  Terminal,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

// Types for debugging data
interface ElementInfo {
  tagName: string;
  id: string;
  className: string;
  attributes: Record<string, string>;
  styles: CSSStyleDeclaration;
  computedStyles: CSSStyleDeclaration;
  rect: DOMRect;
  children: ElementInfo[];
}

interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  detail?: any;
  id?: string;
}

interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  startTime: number;
  endTime: number;
  duration: number;
  size: number;
  type: string;
  headers: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
}

interface ConsoleLog {
  id: string;
  timestamp: number;
  level: "log" | "info" | "warn" | "error";
  message: string;
  args?: any[];
}

interface WebSocketConnection {
  id: string;
  url: string;
  protocol: string;
  readyState: number;
  connectTime: number;
  lastMessageTime: number;
  messageCount: number;
}

// Debug Tools Component
export const DebugTools: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inspector");
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(
    null
  );
  const [inspectorMode, setInspectorMode] = useState(false);
  const [performanceEntries, setPerformanceEntries] = useState<
    PerformanceEntry[]
  >([]);
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [webSocketConnections, setWebSocketConnections] = useState<
    WebSocketConnection[]
  >([]);
  const [filter, setFilter] = useState("");
  const [elementTree, setElementTree] = useState<ElementInfo[]>([]);

  const originalConsole = useRef<Console>(console);
  const originalFetch = useRef<any>(undefined);
  const originalWebSocket = useRef<any>(undefined);

  // Initialize debugging tools
  useEffect(() => {
    if (!isOpen) return;

    // Store original methods
    originalConsole.current = { ...console };
    originalFetch.current = window.fetch;
    originalWebSocket.current = (window as any).WebSocket;

    // Override console methods to capture logs
    overrideConsole();

    // Override fetch to capture network requests
    overrideFetch();

    // Override WebSocket to capture connections
    overrideWebSocket();

    // Start performance monitoring
    startPerformanceMonitoring();

    // Cleanup on unmount
    return () => {
      restoreOriginalMethods();
    };
  }, [isOpen]);

  // Override console methods to capture logs
  const overrideConsole = () => {
    const levels: Array<"log" | "info" | "warn" | "error"> = [
      "log",
      "info",
      "warn",
      "error",
    ];

    levels.forEach((level) => {
      const originalMethod = console[level];

      console[level] = (...args: any[]) => {
        const log: ConsoleLog = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          level,
          message: args[0]?.toString() || "",
          args: args.slice(1),
        };

        setConsoleLogs((prev) => [...prev, log]);
        originalMethod.apply(console, args);
      };
    });
  };

  // Override fetch to capture network requests
  const overrideFetch = () => {
    (window as any).fetch = async (...args: [RequestInfo, RequestInit?]) => {
      const startTime = Date.now();
      const request = new Request(args[0], args[1]);

      const networkRequest: NetworkRequest = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        url: request.url,
        method: request.method,
        status: 0, // Will be set when response is received
        startTime,
        endTime: 0,
        duration: 0,
        size: 0,
        type: request.destination || "fetch",
        headers: Object.fromEntries(request.headers.entries()),
        requestBody: args[1]?.body?.toString() || undefined,
      };

      try {
        const response = await originalFetch.current.apply(window, args);
        const endTime = Date.now();
        const clonedResponse = response.clone();
        const responseBody = await clonedResponse.text();

        // Update the request with response data
        setNetworkRequests((prev) =>
          prev.map((req) =>
            req.id === networkRequest.id
              ? {
                  ...req,
                  status: response.status,
                  endTime,
                  duration: endTime - startTime,
                  size: new Blob([responseBody]).size,
                  responseBody,
                }
              : req
          )
        );

        return response;
      } catch (error) {
        const endTime = Date.now();

        setNetworkRequests((prev) => [
          ...prev,
          {
            ...networkRequest,
            status: 0,
            endTime,
            duration: endTime - startTime,
            size: 0,
            responseBody:
              error instanceof Error ? error.message : "Unknown error",
          },
        ]);

        throw error;
      }
    };
  };

  // Override WebSocket to capture connections
  const overrideWebSocket = () => {
    (window as any).WebSocket = class extends WebSocket {
      id: string;
      connectTime: number;
      lastMessageTime: number;
      messageCount: number;

      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols);
        this.id =
          Date.now().toString() + Math.random().toString(36).substr(2, 9);
        this.connectTime = Date.now();
        this.lastMessageTime = 0;
        this.messageCount = 0;

        // Track the connection
        const connection: WebSocketConnection = {
          id: this.id,
          url: url.toString(),
          protocol: protocols?.toString() || "",
          readyState: this.readyState,
          connectTime: this.connectTime,
          lastMessageTime: this.lastMessageTime,
          messageCount: this.messageCount,
        };

        setWebSocketConnections((prev) => [...prev, connection]);

        // Update connection when ready state changes
        this.addEventListener("open", () => {
          setWebSocketConnections((prev) =>
            prev.map((conn) =>
              conn.id === this.id
                ? { ...conn, readyState: this.readyState }
                : conn
            )
          );
        });

        this.addEventListener("message", (event) => {
          this.lastMessageTime = Date.now();
          this.messageCount++;

          setWebSocketConnections((prev) =>
            prev.map((conn) =>
              conn.id === this.id
                ? {
                    ...conn,
                    lastMessageTime: this.lastMessageTime,
                    messageCount: this.messageCount,
                  }
                : conn
            )
          );

          // Log the message to console
          setConsoleLogs((prev) => [
            ...prev,
            {
              id:
                Date.now().toString() + Math.random().toString(36).substr(2, 9),
              timestamp: Date.now(),
              level: "info",
              message: `WebSocket[${this.id}] message: ${event.data}`,
              args: [event.data],
            },
          ]);
        });

        this.addEventListener("close", () => {
          setWebSocketConnections((prev) =>
            prev.map((conn) =>
              conn.id === this.id
                ? { ...conn, readyState: this.readyState }
                : conn
            )
          );
        });

        this.addEventListener("error", (event) => {
          setConsoleLogs((prev) => [
            ...prev,
            {
              id:
                Date.now().toString() + Math.random().toString(36).substr(2, 9),
              timestamp: Date.now(),
              level: "error",
              message: `WebSocket[${this.id}] error`,
              args: [event],
            },
          ]);
        });
      }
    };
  };

  // Start performance monitoring
  const startPerformanceMonitoring = () => {
    if ("performance" in window) {
      // Capture initial performance entries
      const entries = performance.getEntries();
      setPerformanceEntries(
        entries.map((entry) => ({
          name: entry.name,
          entryType: entry.entryType,
          startTime: entry.startTime,
          duration: entry.duration,
          detail: (entry as any).detail || undefined,
        }))
      );

      // Listen for new performance entries
      const observer = new PerformanceObserver((list) => {
        const newEntries = list.getEntries().map((entry) => ({
          name: entry.name,
          entryType: entry.entryType,
          startTime: entry.startTime,
          duration: entry.duration,
          detail: (entry as any).detail || undefined,
        }));

        setPerformanceEntries((prev) => [...prev, ...newEntries]);
      });

      observer.observe({
        entryTypes: ["navigation", "resource", "measure", "paint", "longtask"],
      });
    }
  };

  // Restore original methods
  const restoreOriginalMethods = () => {
    if (originalConsole.current) {
      Object.assign(console, originalConsole.current);
    }

    if (originalFetch.current) {
      (window as any).fetch = originalFetch.current;
    }

    if (originalWebSocket.current) {
      (window as any).WebSocket = originalWebSocket.current;
    }
  };

  // Handle element selection for inspector
  const handleElementSelection = (element: HTMLElement) => {
    setSelectedElement(element);
    setInspectorMode(false);
  };

  // Handle element hover for inspector
  const handleElementHover = (element: HTMLElement) => {
    if (inspectorMode) {
      setHoveredElement(element);
      highlightElement(element);
    }
  };

  // Highlight element during inspection
  const highlightElement = (element: HTMLElement) => {
    // Remove any existing highlights
    document.querySelectorAll(".debug-highlight").forEach((el) => {
      el.classList.remove("debug-highlight");
    });

    // Add highlight to selected element
    element.classList.add("debug-highlight");

    // Add temporary CSS for highlighting
    if (!document.getElementById("debug-highlight-style")) {
      const style = document.createElement("style");
      style.id = "debug-highlight-style";
      style.textContent = `
        .debug-highlight {
          outline: 2px solid #00ff00 !important;
          outline-offset: 2px !important;
          box-shadow: 0 0 0 4px rgba(0, 255, 0, 0.2) !important;
          transition: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Toggle inspector mode
  const toggleInspectorMode = () => {
    setInspectorMode(!inspectorMode);

    if (!inspectorMode) {
      // Add event listeners for element selection
      document.addEventListener("click", handleElementClick, true);
      document.addEventListener("mouseover", handleElementHoverGlobal, true);
    } else {
      // Remove event listeners
      document.removeEventListener("click", handleElementClick, true);
      document.removeEventListener("mouseover", handleElementHoverGlobal, true);

      // Remove highlight
      document.querySelectorAll(".debug-highlight").forEach((el) => {
        el.classList.remove("debug-highlight");
      });
    }
  };

  // Handle click during inspection
  const handleElementClick = (event: Event) => {
    if (inspectorMode) {
      event.preventDefault();
      event.stopPropagation();

      const element = event.target as HTMLElement;
      if (element) {
        handleElementSelection(element);
      }
    }
  };

  // Handle hover during inspection (global function to avoid redeclaration)
  const handleElementHoverGlobal = (event: Event) => {
    if (inspectorMode) {
      const element = event.target as HTMLElement;
      if (
        element &&
        element !== document.body &&
        element !== document.documentElement
      ) {
        handleElementHover(element);
      }
    }
  };

  // Clear all logs
  const clearLogs = () => {
    setConsoleLogs([]);
    setNetworkRequests([]);
    setPerformanceEntries([]);
  };

  // Filter logs based on level
  const filteredLogs = consoleLogs.filter(
    (log) =>
      log.level.includes(filter.toLowerCase()) ||
      log.message.toLowerCase().includes(filter.toLowerCase())
  );

  // Filter network requests
  const filteredNetworkRequests = networkRequests.filter(
    (req) =>
      req.url.toLowerCase().includes(filter.toLowerCase()) ||
      req.method.toLowerCase().includes(filter.toLowerCase()) ||
      req.status.toString().includes(filter.toLowerCase())
  );

  // Filter performance entries
  const filteredPerformanceEntries = performanceEntries.filter(
    (entry) =>
      entry.name.toLowerCase().includes(filter.toLowerCase()) ||
      entry.entryType.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="fixed bottom-4 right-4 z-[1000]">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 rounded-full p-3 shadow-lg"
          size="icon"
        >
          <Monitor className="h-5 w-5" />
        </Button>
      ) : (
        <Card className="w-96 h-[80vh] flex flex-col shadow-xl border-2 border-purple-500">
          <CardHeader className="p-3 bg-purple-10 rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="h-5 w-5 text-purple-600" />
                Debug Tools
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearLogs}
                  title="Clear all logs"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-4 p-1">
                <TabsTrigger
                  value="inspector"
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" /> Inspector
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="flex items-center gap-1"
                >
                  <Activity className="h-4 w-4" /> Performance
                </TabsTrigger>
                <TabsTrigger
                  value="network"
                  className="flex items-center gap-1"
                >
                  <Network className="h-4 w-4" /> Network
                </TabsTrigger>
                <TabsTrigger
                  value="console"
                  className="flex items-center gap-1"
                >
                  <Terminal className="h-4 w-4" /> Console
                </TabsTrigger>
              </TabsList>

              <div className="p-2">
                <Input
                  placeholder="Filter logs..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="mb-2"
                />
              </div>

              <ScrollArea className="flex-1 overflow-y-auto">
                <TabsContent value="inspector" className="m-0 p-2 h-full">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        variant={inspectorMode ? "default" : "outline"}
                        size="sm"
                        onClick={toggleInspectorMode}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        {inspectorMode ? "Inspecting..." : "Inspect Element"}
                      </Button>

                      {selectedElement && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedElement(null)}
                        >
                          Clear
                        </Button>
                      )}
                    </div>

                    {selectedElement && (
                      <div className="space-y-3">
                        <h3 className="font-semibold">Selected Element</h3>
                        <div className="text-sm">
                          <p>
                            <span className="font-medium">Tag:</span>{" "}
                            {selectedElement.tagName.toLowerCase()}
                          </p>
                          <p>
                            <span className="font-medium">ID:</span>{" "}
                            {selectedElement.id || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Class:</span>{" "}
                            {selectedElement.className || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Rect:</span>{" "}
                            {selectedElement.getBoundingClientRect().width}x
                            {selectedElement.getBoundingClientRect().height}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-1">Computed Styles</h4>
                          <div className="text-xs bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
                            {Object.entries(
                              window.getComputedStyle(selectedElement)
                            )
                              .slice(0, 10)
                              .map(([key, value]) => (
                                <div key={key} className="truncate">
                                  <span className="text-gray-600">{key}:</span>{" "}
                                  {value}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {!selectedElement && !inspectorMode && (
                      <p className="text-sm text-gray-600">
                        Select an element or click "Inspect Element" to begin.
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="m-0 p-2 h-full">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Performance Metrics</h3>
                      <div className="flex gap-1">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Cpu className="h-3 w-3" />
                          {
                            performanceEntries.filter(
                              (e) => e.entryType === "measure"
                            ).length
                          }{" "}
                          Measures
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <HardDrive className="h-3 w-3" />
                          {
                            performanceEntries.filter(
                              (e) => e.entryType === "longtask"
                            ).length
                          }{" "}
                          Long Tasks
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {filteredPerformanceEntries.map((entry, index) => (
                        <div
                          key={entry.id || index}
                          className="p-2 border rounded text-xs"
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">{entry.name}</span>
                            <Badge variant="outline">{entry.entryType}</Badge>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Duration: {entry.duration.toFixed(2)}ms</span>
                            <span>Start: {entry.startTime.toFixed(2)}ms</span>
                          </div>
                        </div>
                      ))}

                      {filteredPerformanceEntries.length === 0 && (
                        <p className="text-sm text-gray-600 text-center py-4">
                          No performance entries to display
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="network" className="m-0 p-2 h-full">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Network Requests</h3>
                      <div className="flex gap-1">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Globe className="h-3 w-3" />
                          {networkRequests.length} Requests
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Wifi className="h-3 w-3" />
                          {webSocketConnections.length} WebSocket
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {filteredNetworkRequests.map((req, index) => (
                        <div
                          key={req.id}
                          className="p-2 border rounded text-xs"
                        >
                          <div className="flex justify-between">
                            <span className="font-medium truncate max-w-[60%]">
                              {req.url}
                            </span>
                            <Badge
                              variant={
                                req.status >= 200 && req.status < 300
                                  ? "default"
                                  : req.status >= 400 && req.status < 500
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {req.method} {req.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Duration: {req.duration.toFixed(2)}ms</span>
                            <span>Size: {(req.size / 1024).toFixed(2)}KB</span>
                          </div>
                        </div>
                      ))}

                      {filteredNetworkRequests.length === 0 && (
                        <p className="text-sm text-gray-600 text-center py-4">
                          No network requests to display
                        </p>
                      )}
                    </div>

                    {webSocketConnections.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2">
                            WebSocket Connections
                          </h4>
                          <div className="space-y-2">
                            {webSocketConnections.map((conn, index) => (
                              <div
                                key={conn.id}
                                className="p-2 border rounded text-xs"
                              >
                                <div className="flex justify-between">
                                  <span className="font-medium truncate max-w-[70%]">
                                    {conn.url}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {conn.readyState === 1 ? (
                                      <Wifi className="h-3 w-3 text-green-500" />
                                    ) : (
                                      <WifiOff className="h-3 w-3 text-red-500" />
                                    )}
                                    <span className="text-xs">
                                      {conn.readyState === 0
                                        ? "Connecting"
                                        : conn.readyState === 1
                                        ? "Open"
                                        : conn.readyState === 2
                                        ? "Closing"
                                        : "Closed"}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-gray-600 text-xs">
                                  Messages: {conn.messageCount} | Last:{" "}
                                  {conn.lastMessageTime
                                    ? new Date(
                                        conn.lastMessageTime
                                      ).toLocaleTimeString()
                                    : "N/A"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="console" className="m-0 p-2 h-full">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Console Logs</h3>
                      <div className="flex gap-1">
                        <Badge variant="outline">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                          {
                            consoleLogs.filter(
                              (l) => l.level === "log" || l.level === "info"
                            ).length
                          }
                        </Badge>
                        <Badge variant="outline">
                          <AlertTriangle className="h-3 w-3 text-yellow-500 mr-1" />
                          {consoleLogs.filter((l) => l.level === "warn").length}
                        </Badge>
                        <Badge variant="outline">
                          <X className="h-3 w-3 text-red-500 mr-1" />
                          {
                            consoleLogs.filter((l) => l.level === "error")
                              .length
                          }
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {filteredLogs.map((log, index) => (
                        <div
                          key={log.id}
                          className={`p-2 text-xs border rounded ${
                            log.level === "error"
                              ? "bg-red-50 border-red-200"
                              : log.level === "warn"
                              ? "bg-yellow-50 border-yellow-200"
                              : log.level === "info"
                              ? "bg-blue-50 border-blue-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-gray-500 text-xs min-w-[70px]">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span
                              className={`font-medium ${
                                log.level === "error"
                                  ? "text-red-700"
                                  : log.level === "warn"
                                  ? "text-yellow-700"
                                  : log.level === "info"
                                  ? "text-blue-700"
                                  : "text-gray-700"
                              }`}
                            >
                              {log.level.toUpperCase()}
                            </span>
                            <span className="flex-1 break-words">
                              {log.message}
                              {log.args && log.args.length > 0 && (
                                <div className="mt-1 text-gray-600">
                                  {JSON.stringify(log.args, null, 2)}
                                </div>
                              )}
                            </span>
                          </div>
                        </div>
                      ))}

                      {filteredLogs.length === 0 && (
                        <p className="text-sm text-gray-600 text-center py-4">
                          No console logs to display
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

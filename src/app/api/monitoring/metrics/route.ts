import { getMonitoring } from "@/lib/monitoring";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const monitoring = getMonitoring();
    const metrics = monitoring.getDashboardMetrics();

    // Set CORS headers
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Content-Type", "application/json");

    return new NextResponse(JSON.stringify(metrics), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);

    return new NextResponse(
      JSON.stringify({
        error: "Failed to fetch metrics",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

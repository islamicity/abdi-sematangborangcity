import React, { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import {
  Network,
  Users,
  Sparkles,
  Search,
  Filter,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  PlusCircle,
  Phone,
  CheckCircle2,
  Building2,
  Briefcase,
  Award,
  Clock,
  MapPin,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  Compass,
  Lightbulb,
  X,
  Share2,
  Info,
  ChevronRight,
  UserCheck,
  Zap,
} from "lucide-react";
import { SkillMapNode, SkillMapLink, CommunitySkillMapData } from "../types";
import { INITIAL_SKILL_MAP_DATA } from "../data/communitySkillMapData";

interface CommunitySkillMapProps {
  currentUserName?: string;
  currentUserRole?: string;
  currentUserKelurahan?: string;
}

export default function CommunitySkillMap({
  currentUserName = "dr. H. Rahmat Pratama, Sp.PD",
  currentUserRole = "Dokter Spesialis Penyakit Dalam",
  currentUserKelurahan = "Sukamulya",
}: CommunitySkillMapProps) {
  // Graph Data State with LocalStorage Persistence
  const [graphData, setGraphData] = useState<CommunitySkillMapData>(() => {
    try {
      const saved = localStorage.getItem("islamicity_community_skill_map_v1");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_SKILL_MAP_DATA;
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("islamicity_community_skill_map_v1", JSON.stringify(graphData));
    } catch {
      // ignore
    }
  }, [graphData]);

  // View & Filter States
  const [viewMode, setViewMode] = useState<"all" | "collaborations" | "expertise" | "masjid">("all");
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<SkillMapNode | null>(null);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [simulationPaused, setSimulationPaused] = useState<boolean>(false);

  // Modal State for Adding New Collaboration
  const [isAddCollabModalOpen, setIsAddCollabModalOpen] = useState<boolean>(false);
  const [collabForm, setCollabForm] = useState({
    member1Id: "mem-01",
    member2Id: "mem-06",
    projectName: "",
    collaborationCount: 1,
    description: "",
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // SVG & Container Ref
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Filtered Graph Data based on View Mode and Filters
  const activeData = useMemo(() => {
    let nodes = [...graphData.nodes];
    let links = [...graphData.links];

    // Filter by Kelurahan if not 'all'
    if (selectedKelurahan !== "all") {
      const allowedNodeIds = new Set<string>();
      nodes.forEach((n) => {
        if (n.type === "skill_hub") {
          allowedNodeIds.add(n.id);
        } else if (n.kelurahan === selectedKelurahan) {
          allowedNodeIds.add(n.id);
        }
      });
      nodes = nodes.filter((n) => allowedNodeIds.has(n.id));
      links = links.filter((l) => {
        const sourceId = typeof l.source === "object" ? (l.source as SkillMapNode).id : l.source;
        const targetId = typeof l.target === "object" ? (l.target as SkillMapNode).id : l.target;
        return allowedNodeIds.has(sourceId as string) && allowedNodeIds.has(targetId as string);
      });
    }

    // Filter by Category if not 'all'
    if (selectedCategory !== "all") {
      const allowedCategories = new Set([selectedCategory]);
      const matchedNodeIds = new Set<string>();

      nodes.forEach((n) => {
        if (n.category === selectedCategory || (n.skillsList && n.skillsList.some((s) => s.toLowerCase().includes(selectedCategory.toLowerCase())))) {
          matchedNodeIds.add(n.id);
        }
        if (n.type === "skill_hub" && n.category === selectedCategory) {
          matchedNodeIds.add(n.id);
        }
        if (n.type === "masjid") {
          matchedNodeIds.add(n.id);
        }
      });

      nodes = nodes.filter((n) => matchedNodeIds.has(n.id));
      links = links.filter((l) => {
        const sourceId = typeof l.source === "object" ? (l.source as SkillMapNode).id : l.source;
        const targetId = typeof l.target === "object" ? (l.target as SkillMapNode).id : l.target;
        return matchedNodeIds.has(sourceId as string) && matchedNodeIds.has(targetId as string);
      });
    }

    // Filter links based on View Mode
    if (viewMode === "collaborations") {
      links = links.filter((l) => l.type === "collaboration");
    } else if (viewMode === "expertise") {
      links = links.filter((l) => l.type === "expertise");
    } else if (viewMode === "masjid") {
      links = links.filter((l) => l.type === "mosque_affiliation");
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchedSearchIds = new Set<string>();
      nodes.forEach((n) => {
        if (
          n.name.toLowerCase().includes(q) ||
          (n.profession && n.profession.toLowerCase().includes(q)) ||
          (n.skillsList && n.skillsList.some((s) => s.toLowerCase().includes(q))) ||
          (n.pastProjects && n.pastProjects.some((p) => p.toLowerCase().includes(q)))
        ) {
          matchedSearchIds.add(n.id);
        }
      });

      // Expand to 1-degree connected nodes
      links.forEach((l) => {
        const sourceId = typeof l.source === "object" ? (l.source as SkillMapNode).id : (l.source as string);
        const targetId = typeof l.target === "object" ? (l.target as SkillMapNode).id : (l.target as string);
        if (matchedSearchIds.has(sourceId)) matchedSearchIds.add(targetId);
        if (matchedSearchIds.has(targetId)) matchedSearchIds.add(sourceId);
      });

      nodes = nodes.filter((n) => matchedSearchIds.has(n.id));
      links = links.filter((l) => {
        const sourceId = typeof l.source === "object" ? (l.source as SkillMapNode).id : (l.source as string);
        const targetId = typeof l.target === "object" ? (l.target as SkillMapNode).id : (l.target as string);
        return matchedSearchIds.has(sourceId) && matchedSearchIds.has(targetId);
      });
    }

    return { nodes, links };
  }, [graphData, viewMode, selectedKelurahan, selectedCategory, searchQuery]);

  // Render D3 Simulation Graph
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 900;
    const height = Math.max(container.clientHeight || 600, 560);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous rendering

    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", width).attr("height", height);

    // Definitions for gradients, drop-shadows, and markers
    const defs = svg.append("defs");

    // Glow filter for highlighted elements
    const filter = defs.append("filter").attr("id", "glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Arrow markers for links if needed
    defs
      .append("marker")
      .attr("id", "arrow-collab")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 22)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#f59e0b");

    // Main Zoomable Group Container
    const g = svg.append("g").attr("class", "graph-content");

    // D3 Zoom Setup
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Clone deep nodes and links for D3 simulation
    const simulationNodes: SkillMapNode[] = activeData.nodes.map((d) => ({ ...d }));
    const simulationLinks: SkillMapLink[] = activeData.links.map((d) => ({
      ...d,
      source: typeof d.source === "object" ? (d.source as SkillMapNode).id : d.source,
      target: typeof d.target === "object" ? (d.target as SkillMapNode).id : d.target,
    }));

    // Create D3 Force Simulation
    const simulation = d3
      .forceSimulation(simulationNodes as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink<d3.SimulationNodeDatum, d3.SimulationLinkDatum<d3.SimulationNodeDatum>>(
            simulationLinks as d3.SimulationLinkDatum<d3.SimulationNodeDatum>[]
          )
          .id((d: any) => d.id)
          .distance((d: any) => {
            if (d.type === "collaboration") return 85;
            if (d.type === "expertise") return 110;
            return 130;
          })
          .strength((d: any) => (d.type === "collaboration" ? 0.8 : 0.5))
      )
      .force("charge", d3.forceManyBody().strength((d: any) => (d.type === "skill_hub" ? -450 : d.type === "masjid" ? -350 : -220)))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collide",
        d3.forceCollide().radius((d: any) => (d.radius || 16) + 16).iterations(2)
      );

    simulationRef.current = simulation as any;

    // Render Links
    const linkGroup = g.append("g").attr("class", "links-group");

    const link = linkGroup
      .selectAll("line")
      .data(simulationLinks)
      .enter()
      .append("line")
      .attr("stroke", (d: any) => {
        if (d.type === "collaboration") return "#f59e0b"; // Gold for past collaborations
        if (d.type === "expertise") return "#38bdf8"; // Sky blue for skill links
        return "#64748b"; // Slate for mosque affiliations
      })
      .attr("stroke-width", (d: any) => {
        if (d.type === "collaboration") return Math.min(Math.max((d.collaborationCount || 1) * 0.9, 2), 6);
        if (d.type === "expertise") return 1.8;
        return 1.2;
      })
      .attr("stroke-dasharray", (d: any) => {
        if (d.type === "expertise") return "3,3";
        if (d.type === "mosque_affiliation") return "2,4";
        return "none";
      })
      .attr("stroke-opacity", (d: any) => (d.type === "collaboration" ? 0.85 : 0.45))
      .attr("cursor", "pointer");

    // Link Tooltip Hover
    link
      .on("mouseenter", function (event: any, d: any) {
        d3.select(this)
          .attr("stroke", "#fbbf24")
          .attr("stroke-opacity", 1)
          .attr("stroke-width", (d: any) => (d.type === "collaboration" ? 6 : 3));
      })
      .on("mouseleave", function (event: any, d: any) {
        d3.select(this)
          .attr("stroke", (d: any) => (d.type === "collaboration" ? "#f59e0b" : d.type === "expertise" ? "#38bdf8" : "#64748b"))
          .attr("stroke-opacity", (d: any) => (d.type === "collaboration" ? 0.85 : 0.45))
          .attr("stroke-width", (d: any) => (d.type === "collaboration" ? Math.min(Math.max((d.collaborationCount || 1) * 0.9, 2), 6) : 1.8));
      });

    // Render Nodes
    const nodeGroup = g.append("g").attr("class", "nodes-group");

    const node = nodeGroup
      .selectAll(".node-item")
      .data(simulationNodes)
      .enter()
      .append("g")
      .attr("class", "node-item cursor-pointer")
      .call(
        d3
          .drag<any, any>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            if (!simulationPaused) {
              d.fx = null;
              d.fy = null;
            }
          })
      );

    // Outer Halo for Skill Hubs and Selected Node
    node
      .filter((d: any) => d.type === "skill_hub" || d.type === "masjid")
      .append("circle")
      .attr("r", (d: any) => (d.radius || 20) + 6)
      .attr("fill", "none")
      .attr("stroke", (d: any) => d.colorHex || "#38bdf8")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,2")
      .attr("stroke-opacity", 0.6)
      .attr("class", "animate-spin-slow");

    // Base Node Circles / Shapes
    node
      .append("circle")
      .attr("r", (d: any) => d.radius || 16)
      .attr("fill", (d: any) => {
        if (d.type === "skill_hub") return d.colorHex || "#10b981";
        if (d.type === "masjid") return "#0f172a";
        return d.avatarColor || "#059669";
      })
      .attr("stroke", (d: any) => {
        if (d.type === "skill_hub") return "#ffffff";
        if (d.type === "masjid") return d.colorHex || "#10b981";
        return "#ffffff";
      })
      .attr("stroke-width", (d: any) => (d.type === "skill_hub" ? 2.5 : d.type === "masjid" ? 3 : 2))
      .attr("filter", (d: any) => (d.type === "skill_hub" ? "url(#glow)" : "none"))
      .attr("opacity", 0.95);

    // Inner Icons / Text Labels in Node
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#ffffff")
      .attr("font-size", (d: any) => (d.type === "skill_hub" ? "12px" : d.type === "masjid" ? "11px" : "10px"))
      .attr("font-weight", "bold")
      .attr("pointer-events", "none")
      .text((d: any) => {
        if (d.type === "skill_hub") return "★";
        if (d.type === "masjid") return "🕌";
        // Initials for members
        const parts = d.name.replace(/dr\.|H\.|Ust\.|Ir\.|Ns\.|S\.Kom|Sp\.PD|Sp\.A|S\.H\.|M\.Kn|M\.T|S\.Pd\.I|S\.E|S\.P/gi, "").trim().split(" ");
        return parts[0] ? parts[0][0] + (parts[1] ? parts[1][0] : "") : "M";
      });

    // Status Indicator Dot for Member Nodes (Tersedia = Green, Bertugas = Yellow, Siaga 24 Jam = Red/Purple)
    node
      .filter((d: any) => d.type === "member")
      .append("circle")
      .attr("cx", (d: any) => (d.radius || 16) * 0.7)
      .attr("cy", (d: any) => -(d.radius || 16) * 0.7)
      .attr("r", 4.5)
      .attr("fill", (d: any) => {
        if (d.status === "Siaga 24 Jam") return "#ef4444";
        if (d.status === "Sedang Bertugas") return "#f59e0b";
        return "#10b981"; // Tersedia
      })
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 1.5);

    // Node Text Labels Underneath
    if (showLabels) {
      node
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", (d: any) => (d.radius || 16) + 14)
        .attr("fill", (d: any) => (d.type === "skill_hub" ? "#fde047" : d.type === "masjid" ? "#67e8f9" : "#e2e8f0"))
        .attr("font-size", (d: any) => (d.type === "skill_hub" ? "11px" : d.type === "masjid" ? "10.5px" : "9.5px"))
        .attr("font-weight", (d: any) => (d.type === "skill_hub" || d.type === "masjid" ? "bold" : "500"))
        .attr("paint-order", "stroke")
        .attr("stroke", "#020617")
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round")
        .attr("pointer-events", "none")
        .text((d: any) => {
          if (d.name.length > 22) return d.name.substring(0, 20) + "...";
          return d.name;
        });
    }

    // Node Interactivity: Click & Hover Effects
    node
      .on("click", (event: any, d: any) => {
        event.stopPropagation();
        setSelectedNode(d);
      })
      .on("mouseenter", function (event: any, d: any) {
        // Highlight connected neighbors
        const connectedNodeIds = new Set<string>([d.id]);

        link.each(function (l: any) {
          const sourceId = l.source.id || l.source;
          const targetId = l.target.id || l.target;
          if (sourceId === d.id || targetId === d.id) {
            connectedNodeIds.add(sourceId);
            connectedNodeIds.add(targetId);
          }
        });

        node.attr("opacity", (n: any) => (connectedNodeIds.has(n.id) ? 1 : 0.2));
        link
          .attr("stroke-opacity", (l: any) => {
            const sourceId = l.source.id || l.source;
            const targetId = l.target.id || l.target;
            return sourceId === d.id || targetId === d.id ? 1 : 0.08;
          })
          .attr("stroke-width", (l: any) => {
            const sourceId = l.source.id || l.source;
            const targetId = l.target.id || l.target;
            return sourceId === d.id || targetId === d.id ? 4.5 : 1;
          });

        d3.select(this).select("circle").attr("stroke", "#f59e0b").attr("stroke-width", 3.5);
      })
      .on("mouseleave", function () {
        node.attr("opacity", 0.95);
        link
          .attr("stroke-opacity", (d: any) => (d.type === "collaboration" ? 0.85 : 0.45))
          .attr("stroke-width", (d: any) => (d.type === "collaboration" ? Math.min(Math.max((d.collaborationCount || 1) * 0.9, 2), 6) : 1.8));

        d3.select(this)
          .select("circle")
          .attr("stroke", (d: any) => (d.type === "skill_hub" ? "#ffffff" : d.type === "masjid" ? d.colorHex || "#10b981" : "#ffffff"))
          .attr("stroke-width", (d: any) => (d.type === "skill_hub" ? 2.5 : d.type === "masjid" ? 3 : 2));
      });

    // Background Click to Reset Selection
    svg.on("click", () => {
      setSelectedNode(null);
    });

    // Simulation Tick Update
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Auto-select first member if none selected
    if (!selectedNode && simulationNodes.length > 0) {
      const firstMember = simulationNodes.find((n) => n.id === "mem-01") || simulationNodes[0];
      setSelectedNode(firstMember);
    }

    return () => {
      simulation.stop();
    };
  }, [activeData, showLabels, simulationPaused]);

  // Zoom Handler Functions
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(500).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  // Find all collaborators of the selected member
  const selectedNodeCollaborators = useMemo(() => {
    if (!selectedNode || selectedNode.type !== "member") return [];
    const collabs: { member: SkillMapNode; count: number; projectName: string; description?: string }[] = [];

    graphData.links.forEach((l) => {
      if (l.type === "collaboration") {
        const sourceId = typeof l.source === "object" ? (l.source as SkillMapNode).id : l.source;
        const targetId = typeof l.target === "object" ? (l.target as SkillMapNode).id : l.target;

        if (sourceId === selectedNode.id) {
          const partner = graphData.nodes.find((n) => n.id === targetId);
          if (partner) {
            collabs.push({
              member: partner,
              count: l.collaborationCount || 1,
              projectName: l.projectName || "Sinergi Khidmah Umat",
              description: l.description,
            });
          }
        } else if (targetId === selectedNode.id) {
          const partner = graphData.nodes.find((n) => n.id === sourceId);
          if (partner) {
            collabs.push({
              member: partner,
              count: l.collaborationCount || 1,
              projectName: l.projectName || "Sinergi Khidmah Umat",
              description: l.description,
            });
          }
        }
      }
    });

    return collabs.sort((a, b) => b.count - a.count);
  }, [selectedNode, graphData]);

  // Network Metrics Calculations
  const networkMetrics = useMemo(() => {
    const memberNodes = graphData.nodes.filter((n) => n.type === "member");
    const skillHubs = graphData.nodes.filter((n) => n.type === "skill_hub");
    const collabLinks = graphData.links.filter((l) => l.type === "collaboration");
    const totalHours = memberNodes.reduce((acc, curr) => acc + (curr.volunteeredHours || 0), 0);

    // Top Collaboration Duos
    const topDuos = [...collabLinks]
      .sort((a, b) => (b.collaborationCount || 0) - (a.collaborationCount || 0))
      .slice(0, 4)
      .map((l) => {
        const sourceId = typeof l.source === "object" ? (l.source as SkillMapNode).id : l.source;
        const targetId = typeof l.target === "object" ? (l.target as SkillMapNode).id : l.target;
        const m1 = graphData.nodes.find((n) => n.id === sourceId);
        const m2 = graphData.nodes.find((n) => n.id === targetId);
        return {
          m1Name: m1?.name || "Relawan A",
          m2Name: m2?.name || "Relawan B",
          count: l.collaborationCount || 1,
          project: l.projectName || "Program Komunitas",
        };
      });

    return {
      totalMembers: memberNodes.length,
      totalHubs: skillHubs.length,
      totalCollabs: collabLinks.length,
      totalHours,
      topDuos,
    };
  }, [graphData]);

  // Handle Add New Collaboration Submit
  const handleAddCollaborationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (collabForm.member1Id === collabForm.member2Id) {
      showToast("Pilih dua anggota masjid yang berbeda untuk mencatat sinergi!");
      return;
    }
    if (!collabForm.projectName.trim()) {
      showToast("Mohon masukkan nama program/proyek kolaborasi!");
      return;
    }

    const newLink: SkillMapLink = {
      source: collabForm.member1Id,
      target: collabForm.member2Id,
      type: "collaboration",
      projectName: collabForm.projectName,
      collaborationCount: Number(collabForm.collaborationCount) || 1,
      strength: 1.0,
      description: collabForm.description || "Kolaborasi aktif dalam program kemaslahatan umat.",
    };

    // Update or Add Link
    const existingIndex = graphData.links.findIndex((l) => {
      if (l.type !== "collaboration") return false;
      const s = typeof l.source === "object" ? (l.source as SkillMapNode).id : l.source;
      const t = typeof l.target === "object" ? (l.target as SkillMapNode).id : l.target;
      return (s === collabForm.member1Id && t === collabForm.member2Id) || (s === collabForm.member2Id && t === collabForm.member1Id);
    });

    let updatedLinks = [...graphData.links];
    if (existingIndex >= 0) {
      const existing = updatedLinks[existingIndex];
      updatedLinks[existingIndex] = {
        ...existing,
        collaborationCount: (existing.collaborationCount || 1) + Number(collabForm.collaborationCount),
        projectName: collabForm.projectName,
        description: collabForm.description || existing.description,
      };
    } else {
      updatedLinks.push(newLink);
    }

    setGraphData({
      ...graphData,
      links: updatedLinks,
    });

    setIsAddCollabModalOpen(false);
    setCollabForm({
      member1Id: "mem-01",
      member2Id: "mem-06",
      projectName: "",
      collaborationCount: 1,
      description: "",
    });
    showToast(`Alhamdulillah! Sinergi kolaborasi "${collabForm.projectName}" berhasil dicatat ke dalam peta graf D3.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Context Info */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/80 rounded-2xl p-5 sm:p-6 border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold mb-2">
              <Network className="w-3.5 h-3.5 text-amber-400" />
              <span>D3 Interactive Network Intelligence & Skill Synergy Map</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Peta Jejaring Keahlian & Sinergi Jamaah
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                Live D3 Graph Engine
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
              Visualisasi jejaring relasi sosial dan profesional antar-jamaah masjid di Sematang Borang. Temukan simpul keahlian medis,
              pendidikan tahfidz, IT dakwah, hukum syariah, hingga jejak kolaborasi gotong-royong di lapangan.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-add-collaboration"
              onClick={() => setIsAddCollabModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Sinergi Baru</span>
            </button>
            <button
              id="btn-reset-zoom"
              onClick={handleResetZoom}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Reset Tampilan & Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Posisi</span>
            </button>
          </div>
        </div>

        {/* Dynamic Key Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Talenta Teregistrasi</span>
            </div>
            <div className="text-lg font-black text-white mt-0.5">{networkMetrics.totalMembers} Relawan</div>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Klaster Keahlian Inti</span>
            </div>
            <div className="text-lg font-black text-white mt-0.5">{networkMetrics.totalHubs} Domain Utama</div>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Ikatan Kolaborasi Lapangan</span>
            </div>
            <div className="text-lg font-black text-amber-300 mt-0.5">{networkMetrics.totalCollabs} Proyek Sinergi</div>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Total Jam Khidmah</span>
            </div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{networkMetrics.totalHours.toLocaleString()} Jam</div>
          </div>
        </div>
      </div>

      {/* Main Filter & Network Control Bar */}
      <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode("all")}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                viewMode === "all" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Semua Relasi (Hybrid)</span>
            </button>
            <button
              onClick={() => setViewMode("collaborations")}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                viewMode === "collaborations"
                  ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                  : "text-amber-300/90 hover:text-amber-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Jejaring Kolaborasi</span>
            </button>
            <button
              onClick={() => setViewMode("expertise")}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                viewMode === "expertise" ? "bg-sky-500 text-slate-950 shadow-sm font-black" : "text-sky-300/90 hover:text-sky-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Peta Keahlian (Hub)</span>
            </button>
            <button
              onClick={() => setViewMode("masjid")}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                viewMode === "masjid" ? "bg-emerald-500 text-slate-950 shadow-sm font-black" : "text-emerald-300/90 hover:text-emerald-200"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Afiliasi Masjid</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama jamaah, keahlian, profesi, atau proyek..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Secondary Category & Kelurahan Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              Kelurahan:
            </span>
            {["all", "Sukamulya", "Lebung Gajah", "Karya Mulya", "Srimulya"].map((kel) => (
              <button
                key={kel}
                onClick={() => setSelectedKelurahan(kel)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  selectedKelurahan === kel
                    ? "bg-slate-700 text-white font-bold border border-slate-600 shadow-xs"
                    : "text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800"
                }`}
              >
                {kel === "all" ? "Semua Kelurahan" : kel}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-0"
              />
              <span>Tampilkan Label Nama</span>
            </label>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
              <button
                onClick={handleZoomIn}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                title="Perbesar Graf"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                title="Perkecil Graf"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: D3 Visualizer Canvas + Details Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* D3 Graph Interactive Stage (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative">
          {/* Graph Legend Overlay */}
          <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1.5 shadow-lg pointer-events-auto">
            <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Petunjuk Simbol Graf:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block border border-white" />
              <span className="text-slate-300">Relawan (Dot Hijau: Tersedia)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block border border-white" />
              <span className="text-slate-300">Klaster Keahlian Inti (Hub)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-900 border-2 border-sky-400 inline-block" />
              <span className="text-slate-300">Masjid / Pangkalan Dakwah</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <span className="w-4 h-0.5 bg-amber-400 inline-block" />
              <span className="text-amber-300 font-semibold">Garis Emas: Jejak Kolaborasi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-t border-dashed border-sky-400 inline-block" />
              <span className="text-sky-300">Garis Putus: Keahlian Terdaftar</span>
            </div>
          </div>

          {/* D3 Canvas Container */}
          <div ref={containerRef} className="w-full h-[580px] sm:h-[620px] bg-radial from-slate-900 via-slate-950 to-slate-950 flex items-center justify-center">
            <svg ref={svgRef} className="w-full h-full select-none" />
          </div>

          {/* Canvas Bottom Helper Note */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span>
                <strong>Tips Interaktif:</strong> Klik pada lingkaran jamaah/klaster untuk melihat detail lengkap & jejak kolaborasi. Tarik (drag) simpul untuk merapikan visual.
              </span>
            </div>
            <span className="text-slate-500 font-mono text-[11px]">D3.js Force v7.9</span>
          </div>
        </div>

        {/* Selected Node Details Inspector & Collaboration Summary (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {selectedNode ? (
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 animate-in fade-in duration-200">
              {/* Header Info */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md border-2 border-white/20"
                    style={{ backgroundColor: selectedNode.colorHex || selectedNode.avatarColor || "#059669" }}
                  >
                    {selectedNode.type === "skill_hub" ? "★" : selectedNode.type === "masjid" ? "🕌" : "👤"}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">{selectedNode.name}</h3>
                    <p className="text-xs text-amber-400 font-medium">
                      {selectedNode.profession || selectedNode.category}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedNode.type === "skill_hub" ? "Klaster Keahlian" : selectedNode.type === "masjid" ? "Masjid" : "Jamaah / Relawan"}
                </span>
              </div>

              {/* Node Metadata Badges */}
              {selectedNode.type === "member" && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[11px]">Masjid & Domisili</div>
                    <div className="font-bold text-slate-200 mt-0.5 truncate">{selectedNode.masjid || "Sematang Borang"}</div>
                    <div className="text-[10px] text-emerald-400 font-medium">{selectedNode.kelurahan}</div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[11px]">Status Kesiapan</div>
                    <div className="font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          selectedNode.status === "Siaga 24 Jam"
                            ? "bg-red-400"
                            : selectedNode.status === "Sedang Bertugas"
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        }`}
                      />
                      <span>{selectedNode.status || "Tersedia"}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{selectedNode.volunteeredHours || 0} Jam Khidmah</div>
                  </div>
                </div>
              )}

              {/* Bio / Description */}
              {selectedNode.bio && (
                <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {selectedNode.bio}
                </div>
              )}

              {/* Skills List Badges */}
              {selectedNode.skillsList && selectedNode.skillsList.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-sky-400" />
                    <span>Keahlian & Lisensi Terdaftar:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.skillsList.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-sky-950/70 border border-sky-500/30 text-sky-300 text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Collaborations with other members */}
              {selectedNode.type === "member" && (
                <div>
                  <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Mitra Sinergi ({selectedNodeCollaborators.length}):</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Riwayat Proyek Bersama</span>
                  </div>

                  {selectedNodeCollaborators.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedNodeCollaborators.map((c, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedNode(c.member)}
                          className="bg-slate-950/90 hover:bg-slate-800 p-2.5 rounded-xl border border-slate-800 transition cursor-pointer flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{ backgroundColor: c.member.avatarColor || "#059669" }}
                            >
                              {c.member.name[0]}
                            </div>
                            <div className="overflow-hidden">
                              <div className="text-xs font-bold text-slate-200 truncate">{c.member.name}</div>
                              <div className="text-[10px] text-amber-400 truncate">{c.projectName}</div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] shrink-0 border border-amber-500/30">
                            {c.count}x Sinergi
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      Belum ada riwayat kolaborasi terhubung. Klik tombol &quot;Catat Sinergi Baru&quot; untuk menghubungkan relawan ini!
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                {selectedNode.type === "member" && selectedNode.contactPhone && (
                  <a
                    href={`https://wa.me/${selectedNode.contactPhone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Hubungi via WhatsApp ({selectedNode.contactPhone})</span>
                  </a>
                )}
                <button
                  onClick={() => {
                    setCollabForm({
                      ...collabForm,
                      member1Id: selectedNode.id,
                    });
                    setIsAddCollabModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ajak Kolaborasi Proyek Bersama</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-center space-y-3">
              <Compass className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="font-bold text-slate-300 text-sm">Pilih Simpul di Peta</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Klik salah satu lingkaran jamaah, klaster keahlian, atau masjid untuk memeriksa profil lengkap, daftar kompetensi terverifikasi, serta ikatan sinergi khidmah.
              </p>
            </div>
          )}

          {/* Top Sinergi Duos Summary Card */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Duet Sinergi Terkuat (Top Collaborators)</span>
              </h4>
              <span className="text-[10px] text-emerald-400 font-semibold">Tervalidasi DKM</span>
            </div>

            <div className="space-y-2">
              {networkMetrics.topDuos.map((duo, idx) => (
                <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs flex items-center justify-between gap-2">
                  <div className="overflow-hidden">
                    <div className="font-semibold text-slate-200 truncate">
                      {duo.m1Name} <span className="text-amber-400">&</span> {duo.m2Name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{duo.project}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] shrink-0">
                    {duo.count}x Aksi
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Catat Sinergi / Kolaborasi Baru */}
      {isAddCollabModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Catat Sinergi Kolaborasi Baru</h3>
                  <p className="text-xs text-slate-400">Hubungkan dua relawan dalam proyek kemaslahatan umat</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddCollabModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCollaborationSubmit} className="space-y-4 text-xs">
              {/* Member 1 & Member 2 Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Relawan Pertama:</label>
                  <select
                    value={collabForm.member1Id}
                    onChange={(e) => setCollabForm({ ...collabForm, member1Id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    {graphData.nodes
                      .filter((n) => n.type === "member")
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.kelurahan})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Relawan Kedua (Mitra):</label>
                  <select
                    value={collabForm.member2Id}
                    onChange={(e) => setCollabForm({ ...collabForm, member2Id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    {graphData.nodes
                      .filter((n) => n.type === "member")
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.kelurahan})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Program / Proyek Bersama:</label>
                <input
                  type="text"
                  value={collabForm.projectName}
                  onChange={(e) => setCollabForm({ ...collabForm, projectName: e.target.value })}
                  placeholder="Contoh: Baksos Medis & Khitanan Massal Ramadan"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Number of Collaborations */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Frekuensi / Jumlah Kerjasama (Kali):</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={collabForm.collaborationCount}
                  onChange={(e) => setCollabForm({ ...collabForm, collaborationCount: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deskripsi Hasil & Catatan Lapangan:</label>
                <textarea
                  value={collabForm.description}
                  onChange={(e) => setCollabForm({ ...collabForm, description: e.target.value })}
                  placeholder="Contoh: Bersama menangani 150 warga lansia dan menyalurkan paket vitamin posko."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCollabModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold hover:from-amber-400 hover:to-amber-300 transition shadow-lg shadow-amber-500/20"
                >
                  Simpan & Perbarui Peta Graf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-amber-400/80 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}

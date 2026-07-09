"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type Language = "en" | "ja" | "hi";

const LANGUAGE_STORAGE_KEY = "nexaops.language";

const locales: Record<Language, string> = {
  en: "en-US",
  ja: "ja-JP",
  hi: "hi-IN",
};

type Translations = {
  brandName: string;
  nav: {
    features: string;
    resources: string;
    pricing: string;
    docs: string;
    signIn: string;
    dashboard: string;
    getStarted: string;
    signOut: string;
    contact: string;
    signedIn: string;
  };
  featureBadge: {
    live: string;
    comingSoon: string;
  };
  landing: {
    poweringReliability: string;
    whyTitle: string;
    whySubtitle: string;
    cards: {
      incidentManagement: { title: string; desc: string };
      timeline: { title: string; desc: string };
      rbac: { title: string; desc: string };
      onCall: { title: string; desc: string };
      integrations: { title: string; desc: string };
      runbooks: { title: string; desc: string };
    };
    resourcesTitle: string;
    resourcesSubtitle: string;
    viewAllResources: string;
    readMore: string;
    resourceCards: {
      guide: { category: string; title: string; desc: string };
      webinar: { category: string; title: string; desc: string };
      caseStudy: { category: string; title: string; desc: string };
    };
    ctaTitle: string;
    ctaSubtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  footer: {
    product: string;
    company: string;
    resources: string;
    legal: string;
    incidents: string;
    onCall: string;
    postMortems: string;
    statusPages: string;
    aboutUs: string;
    careers: string;
    customers: string;
    contact: string;
    blog: string;
    documentation: string;
    community: string;
    partners: string;
    privacy: string;
    terms: string;
    security: string;
    rights: string;
  };
  chat: {
    title: string;
    greeting: string;
    fallback: string;
    pricingReply: string;
    featuresReply: string;
    placeholder: string;
  };
  dashboard: {
    overview: string;
    incidents: string;
    settings: string;
    tenant: string;
    createIncident: string;
    totalIncidents: string;
    activeNow: string;
    critical: string;
    high: string;
    noIncidents: string;
    statusLabel: string;
    createdBy: string;
    unknown: string;
    assignedTo: string;
    unassigned: string;
    filterAll: string;
    filterMine: string;
    searchPlaceholder: string;
    allStatuses: string;
    allSeverities: string;
    severity: {
      CRITICAL: string;
      HIGH: string;
      MEDIUM: string;
      LOW: string;
    };
    status: {
      OPEN: string;
      ACKNOWLEDGED: string;
      IN_PROGRESS: string;
      RESOLVED: string;
      CLOSED: string;
    };
  };
  hero: {
    badge: string;
    titleStart: string;
    titleEnd: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustedBy: string;
  };
  features: {
    heroTitle: string;
    heroSubtitle: string;
    openDashboard: string;
    login: string;
    badge: string;
    tryDashboard: string;
    exploreResources: string;
    howTeamsUseTitle: string;
    howTeamsUseSubtitle: string;
    deepDives: {
      incidentTimeline: { title: string; points: string[] };
      onCall: { title: string; points: string[] };
      collaboration: { title: string; points: string[] };
      guardrails: { title: string; points: string[] };
    };
    teams: {
      sre: { label: string; title: string; desc: string };
      platform: { label: string; title: string; desc: string };
      security: { label: string; title: string; desc: string };
    };
    seeItInAction: string;
    highlights: {
      alerting: { title: string; copy: string };
      runbooks: { title: string; copy: string };
      rbac: { title: string; copy: string };
      insights: { title: string; copy: string };
    };
  };
  pricing: {
    heroTitle: string;
    heroSubtitle: string;
    earlyAccess: string;
    perMonth: string;
    freeForever: string;
    startFree: string;
    supportTitle: string;
    supportText: string;
    getStarted: string;
    invoiceTitle: string;
    invoiceText: string;
    contactSales: string;
    planFeatures: string[];
  };
  resources: {
    heroTitle: string;
    heroSubtitle: string;
    searchPlaceholder: string;
    readMore: string;
    goToDashboard: string;
    items: {
      guideIncidentManagement: { type: string; title: string; desc: string };
      webinarResilientSystems: { type: string; title: string; desc: string };
      articlePostMortem: { type: string; title: string; desc: string };
      guideOnCallHealth: { type: string; title: string; desc: string };
      articleSLO: { type: string; title: string; desc: string };
      webinarAutomation: { type: string; title: string; desc: string };
    };
  };
  incidentForm: {
    loading: string;
    accessDenied: string;
    permissionDenied: string;
    createTitle: string;
    errorGeneric: string;
    title: string;
    titleRequired: string;
    description: string;
    severity: string;
    cancel: string;
    create: string;
    creating: string;
  };
  incidentDetail: {
    reportedBy: string;
    on: string;
    timeline: string;
    noActivity: string;
    placeholder: string;
    post: string;
    posting: string;
  };
  auth: {
    signInTitle: string;
    signInSubtitle: string;
    createAccount: string;
    emailLabel: string;
    passwordLabel: string;
    signInButton: string;
    createAccountTitle: string;
    companyNameLabel: string;
    fullNameLabel: string;
    signInLink: string;
    createAccountButton: string;
    creatingAccount: string;
    errorInvalid: string;
    errorGeneric: string;
    forgotPasswordLink: string;
    forgotTitle: string;
    forgotSubtitle: string;
    sendResetLink: string;
    sending: string;
    forgotSuccess: string;
    resetTitle: string;
    newPasswordLabel: string;
    confirmPasswordLabel: string;
    resetButton: string;
    resetting: string;
    resetSuccess: string;
    resetInvalid: string;
    passwordMismatch: string;
    backToLogin: string;
  };
  team: {
    title: string;
    members: string;
    invitations: string;
    inviteMember: string;
    sendInvite: string;
    sending: string;
    inviteSent: string;
    member: string;
    role: string;
    joined: string;
    actions: string;
    you: string;
    remove: string;
    confirmRemove: string;
    noInvitations: string;
    expires: string;
    revoke: string;
    errorGeneric: string;
    roles: {
      OWNER: string;
      ADMIN: string;
      RESPONDER: string;
      OBSERVER: string;
      VIEWER: string;
    };
    invitedToJoin: string;
    asRole: string;
    joinTeam: string;
    joining: string;
    inviteInvalid: string;
    acceptTitle: string;
  };
  settings: {
    title: string;
    profile: string;
    accountReference: string;
    preferences: string;
    theme: string;
    language: string;
    role: string;
    tenantId: string;
    email: string;
    fullName: string;
    tenantName: string;
  };
  contact: {
    heroTitle: string;
    heroSubtitle: string;
    form: {
      nameLabel: string;
      emailLabel: string;
      companyLabel: string;
      messageLabel: string;
      submitButton: string;
      submitting: string;
      successMessage: string;
    };
    sales: {
      title: string;
      description: string;
      email: string;
    };
    support: {
      title: string;
      description: string;
      email: string;
    };
  };
};

const translations: Record<Language, Translations> = {
  en: {
    brandName: "NexaOps",
    dashboard: {
      overview: "Overview",
      incidents: "Incidents",
      settings: "Settings",
      tenant: "Tenant",
      createIncident: "Create Incident",
      totalIncidents: "Total incidents",
      activeNow: "Active now",
      critical: "Critical",
      high: "High",
      noIncidents: "No incidents found.",
      statusLabel: "Status:",
      createdBy: "Created by",
      unknown: "Unknown",
      assignedTo: "Assigned to",
      unassigned: "Unassigned",
      filterAll: "All",
      filterMine: "Assigned to me",
      searchPlaceholder: "Search incidents...",
      allStatuses: "All statuses",
      allSeverities: "All severities",
      severity: {
        CRITICAL: "Critical",
        HIGH: "High",
        MEDIUM: "Medium",
        LOW: "Low",
      },
      status: {
        OPEN: "Open",
        ACKNOWLEDGED: "Acknowledged",
        IN_PROGRESS: "In Progress",
        RESOLVED: "Resolved",
        CLOSED: "Closed",
      },
    },
    nav: {
      features: "Features",
      resources: "Resources",
      pricing: "Pricing",
      docs: "Docs",
      signIn: "Sign In",
      dashboard: "Go to Dashboard",
      getStarted: "Get Started",
      signOut: "Sign Out",
      contact: "Contact",
      signedIn: "Signed in",
    },
    featureBadge: {
      live: "Live",
      comingSoon: "Coming Soon",
    },
    landing: {
      poweringReliability: "Powering reliability at",
      whyTitle: "Why NexaOps?",
      whySubtitle:
        "Everything you need to resolve incidents faster and learn from them effectively.",
      cards: {
        incidentManagement: {
          title: "Incident Management",
          desc: "Create, track, and resolve incidents with severity levels, status updates, and a live timeline.",
        },
        timeline: {
          title: "Timeline & Comments",
          desc: "Capture status changes and team comments in a searchable incident timeline with real-time updates.",
        },
        rbac: {
          title: "Role-Based Access",
          desc: "Multi-tenant isolation with OWNER, ADMIN, RESPONDER, and VIEWER roles guarding who can act on incidents.",
        },
        onCall: {
          title: "On-Call Scheduling",
          desc: "Fair and flexible on-call rotations that prevent burnout and ensure coverage.",
        },
        integrations: {
          title: "Universal Integrations",
          desc: "Connect with Slack, Jira, Zoom, PagerDuty, and 100+ observability tools.",
        },
        runbooks: {
          title: "Runbooks & Post-mortems",
          desc: "Interactive runbooks and blameless post-mortem templates to turn incidents into learning.",
        },
      },
      resourcesTitle: "Resources",
      resourcesSubtitle: "Learn best practices from industry experts.",
      viewAllResources: "View all resources",
      readMore: "Read more",
      resourceCards: {
        guide: {
          category: "Guide",
          title: "The Comprehensive Guide to Incident Management",
          desc: "From SEV1 to Post-mortem, learn how to handle critical incidents.",
        },
        webinar: {
          category: "Webinar",
          title: "Building a Culture of Reliability",
          desc: "Watch our panel discussion with SRE leaders from top tech companies.",
        },
        caseStudy: {
          category: "Case Study",
          title: "How TechFlow Reduced MTTR by 60%",
          desc: "See how TechFlow leveraged NexaOps to streamline their response.",
        },
      },
      ctaTitle: "Ready to improve your reliability?",
      ctaSubtitle:
        "Join thousands of developers who trust NexaOps to manage their critical incidents.",
      ctaPrimary: "Get Started for Free",
      ctaSecondary: "Contact Sales",
    },
    footer: {
      product: "Product",
      company: "Company",
      resources: "Resources",
      legal: "Legal",
      incidents: "Incidents",
      onCall: "On-Call",
      postMortems: "Post-mortems",
      statusPages: "Status Pages",
      aboutUs: "About Us",
      careers: "Careers",
      customers: "Customers",
      contact: "Contact",
      blog: "Blog",
      documentation: "Documentation",
      community: "Community",
      partners: "Partners",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      security: "Security",
      rights: "All rights reserved.",
    },
    chat: {
      title: "NexaOps Support",
      greeting: "Hello! How can I help you with NexaOps today?",
      fallback: "Thanks for reaching out! Our team will get back to you shortly.",
      pricingReply:
        "NexaOps is currently free while in active development. Check our Pricing section for details.",
      featuresReply:
        "NexaOps provides Incident Management, On-call scheduling, and automated Post-mortems.",
      placeholder: "Type a message...",
    },
    hero: {
      badge: "New: NexaOps AI Assistant",
      titleStart: "Incident management for",
      titleEnd: "modern engineering teams",
      subtitle:
        "Automate incident response, manage on-call schedules, and conduct blameless post-mortems. NexaOps helps you build more reliable software, faster.",
      ctaPrimary: "Start handling incidents free",
      ctaSecondary: "Watch Demo",
      trustedBy: "Trusted by engineering teams everywhere",
    },
    features: {
      heroTitle: "Features",
      heroSubtitle: "Everything you need to resolve incidents faster.",
      openDashboard: "Open dashboard",
      login: "Login",
      badge: "Built for incident teams",
      tryDashboard: "Try the dashboard",
      exploreResources: "Explore resources",
      howTeamsUseTitle: "How teams use NexaOps",
      howTeamsUseSubtitle:
        "From the first page to the post-mortem, NexaOps stitches together your incident lifecycle with opinionated defaults and flexible automation.",
      deepDives: {
        incidentTimeline: {
          title: "Incident timeline",
          points: [
            "Auto-capture events from chat, alerts, and status updates",
            "One-click export for post-mortems",
            "Searchable context for handoffs",
          ],
        },
        onCall: {
          title: "On-call & paging",
          points: [
            "Rotations with follow-the-sun coverage",
            "Escalation policies with fallback channels",
            "Quiet hours and overrides for special cases",
          ],
        },
        collaboration: {
          title: "Collaboration",
          points: [
            "Slack-first experience with synced status",
            "Zoom/Meet bridges created automatically",
            "Announcements for execs and customers",
          ],
        },
        guardrails: {
          title: "Reliability guardrails",
          points: [
            "SLOs with error budget alerts",
            "Service catalog with ownership",
            "Release checks against active incidents",
          ],
        },
      },
      teams: {
        sre: {
          label: "Built for SREs",
          title: "Resilient SRE teams",
          desc: "Pair on-call, automation, and learning loops so SREs can keep customers happy and engineers unblocked.",
        },
        platform: {
          label: "Built for Platform",
          title: "Resilient Platform teams",
          desc: "Pair on-call, automation, and learning loops so Platform teams can keep customers happy and engineers unblocked.",
        },
        security: {
          label: "Built for Security",
          title: "Resilient Security teams",
          desc: "Pair on-call, automation, and learning loops so Security teams can keep customers happy and engineers unblocked.",
        },
      },
      seeItInAction: "See it in action",
      highlights: {
        alerting: {
          title: "Smart alerting",
          copy: "Route incidents by service ownership, severity, and on-call schedules.",
        },
        runbooks: {
          title: "Automated runbooks",
          copy: "Trigger repeatable workflows that open war rooms and post to Slack.",
        },
        rbac: {
          title: "Role-based control",
          copy: "Granular roles for admins, responders, and viewers.",
        },
        insights: {
          title: "MTTR insights",
          copy: "Out-of-the-box dashboards for MTTA, MTTR, and incident burndown.",
        },
      },
    },
    pricing: {
      heroTitle: "Currently Building 🛠️",
      heroSubtitle:
        "NexaOps is free to use while we are in active development. All features are available to everyone.",
      earlyAccess: "Early Access",
      perMonth: "/mo",
      freeForever: "Free forever for community and early adopters.",
      startFree: "Start using for free",
      supportTitle: "Support the Developer",
      supportText:
        "If you like what we're building and want to support the infrastructure costs or buy me a coffee, you can donate below.",
      getStarted: "Get Started",
      invoiceTitle: "Need invoice or custom pricing?",
      invoiceText:
        "Talk to sales for enterprise billing, procurement, and custom rollout support.",
      contactSales: "Contact sales",
      planFeatures: [
        "Unlimited Incidents",
        "Unlimited Team Members",
        "Slack & Discord Integration",
        "Post-Mortem Generator",
        "Basic On-Call Scheduling",
      ],
    },
    resources: {
      heroTitle: "NexaOps Resources",
      heroSubtitle:
        "Insights, guides, and best practices to help you build reliable systems and effective teams.",
      searchPlaceholder: "Search articles, guides, and more...",
      readMore: "Read more",
      goToDashboard: "Go to Dashboard",
      items: {
        guideIncidentManagement: {
          type: "Guide",
          title: "The Ultimate Guide to Incident Management",
          desc: "Everything you need to know about setting up an incident response process from scratch.",
        },
        webinarResilientSystems: {
          type: "Webinar",
          title: "Building Resilient Systems at Scale",
          desc: "Learn from SREs at Netflix and Google about how they design for failure.",
        },
        articlePostMortem: {
          type: "Article",
          title: "Post-Mortem Best Practices",
          desc: "How to conduct blameless post-mortems that actually lead to system improvements.",
        },
        guideOnCallHealth: {
          type: "Guide",
          title: "On-Call Health Check",
          desc: "A framework for assessing and improving the health of your on-call rotations.",
        },
        articleSLO: {
          type: "Article",
          title: "Defining Service Level Objectives",
          desc: "A practical guide to choosing and measuring the right SLOs for your service.",
        },
        webinarAutomation: {
          type: "Webinar",
          title: "Automation in Incident Response",
          desc: "Demystifying runbook automation and how to get started.",
        },
      },
    },
    incidentForm: {
      loading: "Loading...",
      accessDenied: "Access Denied",
      permissionDenied:
        "You do not have permission to create incidents. Please contact your administrator.",
      createTitle: "Create New Incident",
      errorGeneric: "Something went wrong. Please try again.",
      title: "Title",
      titleRequired: "Title is required",
      description: "Description",
      severity: "Severity",
      cancel: "Cancel",
      create: "Create Incident",
      creating: "Creating...",
    },
    incidentDetail: {
      reportedBy: "Reported by",
      on: "on",
      timeline: "Timeline & Comments",
      noActivity: "No activity yet.",
      placeholder: "Add a note or update...",
      post: "Post Comment",
      posting: "Posting...",
    },
    auth: {
      signInTitle: "Sign in to your account",
      signInSubtitle: "Or",
      createAccount: "create a new company account",
      emailLabel: "Email address",
      passwordLabel: "Password",
      signInButton: "Sign in",
      createAccountTitle: "Create your account",
      companyNameLabel: "Company Name",
      fullNameLabel: "Full Name",
      signInLink: "sign in to existing account",
      createAccountButton: "Create account",
      creatingAccount: "Creating...",
      errorInvalid: "Invalid email or password",
      errorGeneric: "Registration failed",
      forgotPasswordLink: "Forgot password?",
      forgotTitle: "Reset your password",
      forgotSubtitle:
        "Enter your email address and we'll send you a reset link.",
      sendResetLink: "Send reset link",
      sending: "Sending...",
      forgotSuccess:
        "If that email is registered, a reset link has been sent. Check your inbox.",
      resetTitle: "Choose a new password",
      newPasswordLabel: "New password",
      confirmPasswordLabel: "Confirm password",
      resetButton: "Reset password",
      resetting: "Resetting...",
      resetSuccess: "Password updated! You can now sign in.",
      resetInvalid: "This reset link is invalid or has expired.",
      passwordMismatch: "Passwords do not match",
      backToLogin: "Back to sign in",
    },
    team: {
      title: "Team",
      members: "Members",
      invitations: "Pending Invitations",
      inviteMember: "Invite Member",
      sendInvite: "Send Invite",
      sending: "Sending...",
      inviteSent: "Invitation sent!",
      member: "Member",
      role: "Role",
      joined: "Joined",
      actions: "Actions",
      you: "You",
      remove: "Remove",
      confirmRemove: "Remove this member from the team?",
      noInvitations: "No pending invitations.",
      expires: "Expires",
      revoke: "Revoke",
      errorGeneric: "Something went wrong. Please try again.",
      roles: {
        OWNER: "Owner",
        ADMIN: "Admin",
        RESPONDER: "Responder",
        OBSERVER: "Observer",
        VIEWER: "Viewer",
      },
      invitedToJoin: "You've been invited to join",
      asRole: "as",
      joinTeam: "Join Team",
      joining: "Joining...",
      inviteInvalid: "This invitation is invalid or has expired.",
      acceptTitle: "Accept Invitation",
    },
    settings: {
      title: "Settings",
      profile: "Profile",
      accountReference: "Account Reference",
      preferences: "Preferences",
      theme: "Theme",
      language: "Language",
      role: "Role",
      tenantId: "Tenant ID",
      email: "Email",
      fullName: "Full Name",
      tenantName: "Tenant Name",
    },
    contact: {
      heroTitle: "Contact our team",
      heroSubtitle:
        "Got questions? We're here to help. Chat to our friendly team 24/7 and get things solved within 2 hours.",
      form: {
        nameLabel: "Name",
        emailLabel: "Work email",
        companyLabel: "Company website",
        messageLabel: "Message",
        submitButton: "Send message",
        submitting: "Sending...",
        successMessage: "Message sent! We'll be in touch shortly.",
      },
      sales: {
        title: "Talk to Sales",
        description:
          "Interested in our Enterprise plan? Let's talk about how we can help your team.",
        email: "sales@nexaops.com",
      },
      support: {
        title: "Help & Support",
        description:
          "Already a customer? Get help with your account or technical questions.",
        email: "support@nexaops.com",
      },
    },
  },
  ja: {
    brandName: "NexaOps",
    dashboard: {
      overview: "概要",
      incidents: "インシデント",
      settings: "設定",
      tenant: "テナント",
      createIncident: "インシデント作成",
      totalIncidents: "総インシデント数",
      activeNow: "現在アクティブ",
      critical: "重大",
      high: "高",
      noIncidents: "インシデントは見つかりませんでした。",
      statusLabel: "ステータス:",
      createdBy: "作成者",
      unknown: "不明",
      assignedTo: "担当者:",
      unassigned: "未割り当て",
      filterAll: "すべて",
      filterMine: "自分の担当",
      searchPlaceholder: "インシデントを検索...",
      allStatuses: "すべてのステータス",
      allSeverities: "すべての重大度",
      severity: {
        CRITICAL: "重大",
        HIGH: "高",
        MEDIUM: "中",
        LOW: "低",
      },
      status: {
        OPEN: "オープン",
        ACKNOWLEDGED: "確認済み",
        IN_PROGRESS: "進行中",
        RESOLVED: "解決済み",
        CLOSED: "クローズ",
      },
    },
    nav: {
      features: "機能",
      resources: "リソース",
      pricing: "料金",
      docs: "ドキュメント",
      signIn: "ログイン",
      dashboard: "ダッシュボードへ",
      getStarted: "始める",
      signOut: "ログアウト",
      contact: "お問い合わせ",
      signedIn: "ログイン中",
    },
    featureBadge: {
      live: "提供中",
      comingSoon: "近日公開",
    },
    landing: {
      poweringReliability: "信頼性を支えている企業",
      whyTitle: "なぜNexaOps？",
      whySubtitle:
        "インシデントをより迅速に解決し、効果的に学ぶために必要なすべて。",
      cards: {
        incidentManagement: {
          title: "インシデント管理",
          desc: "深刻度レベル、ステータス更新、ライブタイムラインでインシデントを作成、追跡、解決します。",
        },
        timeline: {
          title: "タイムラインとコメント",
          desc: "ステータス変更とチームのコメントを、リアルタイム更新付きの検索可能なタイムラインに記録します。",
        },
        rbac: {
          title: "ロールベースのアクセス",
          desc: "OWNER、ADMIN、RESPONDER、VIEWERの役割によるマルチテナント分離で、誰がインシデントに対応できるかを管理します。",
        },
        onCall: {
          title: "オンコールスケジューリング",
          desc: "燃え尽きを防ぎ、カバレッジを確保する公平で柔軟なオンコールローテーション。",
        },
        integrations: {
          title: "ユニバーサル統合",
          desc: "Slack、Jira、Zoom、PagerDuty、100以上の可観測性ツールと連携します。",
        },
        runbooks: {
          title: "ランブックとポストモーテム",
          desc: "インシデントを学びに変える、インタラクティブなランブックと非難のないポストモーテムテンプレート。",
        },
      },
      resourcesTitle: "リソース",
      resourcesSubtitle: "業界の専門家からベストプラクティスを学びましょう。",
      viewAllResources: "すべてのリソースを見る",
      readMore: "続きを読む",
      resourceCards: {
        guide: {
          category: "ガイド",
          title: "インシデント管理の総合ガイド",
          desc: "SEV1からポストモーテムまで、重大インシデントの対応方法を学びます。",
        },
        webinar: {
          category: "ウェビナー",
          title: "信頼性の文化を築く",
          desc: "大手テック企業のSREリーダーによるパネルディスカッションをご覧ください。",
        },
        caseStudy: {
          category: "事例研究",
          title: "TechFlowがMTTRを60%削減した方法",
          desc: "TechFlowがNexaOpsを活用して対応を効率化した方法をご覧ください。",
        },
      },
      ctaTitle: "信頼性を向上させる準備はできましたか？",
      ctaSubtitle:
        "重大インシデントの管理をNexaOpsに任せる数千人の開発者に加わりましょう。",
      ctaPrimary: "無料で始める",
      ctaSecondary: "営業に問い合わせる",
    },
    footer: {
      product: "製品",
      company: "会社",
      resources: "リソース",
      legal: "法的情報",
      incidents: "インシデント",
      onCall: "オンコール",
      postMortems: "ポストモーテム",
      statusPages: "ステータスページ",
      aboutUs: "会社概要",
      careers: "採用情報",
      customers: "お客様",
      contact: "お問い合わせ",
      blog: "ブログ",
      documentation: "ドキュメント",
      community: "コミュニティ",
      partners: "パートナー",
      privacy: "プライバシーポリシー",
      terms: "利用規約",
      security: "セキュリティ",
      rights: "無断複写・転載を禁じます。",
    },
    chat: {
      title: "NexaOpsサポート",
      greeting: "こんにちは！NexaOpsについて何かお手伝いできますか？",
      fallback:
        "お問い合わせありがとうございます！担当者がまもなくご連絡いたします。",
      pricingReply:
        "NexaOpsは現在開発中のため無料でご利用いただけます。詳細は料金セクションをご覧ください。",
      featuresReply:
        "NexaOpsはインシデント管理、オンコールスケジューリング、自動ポストモーテムを提供します。",
      placeholder: "メッセージを入力...",
    },
    hero: {
      badge: "新機能：NexaOps AIアシスタント",
      titleStart: "現代のエンジニアリングチームのための",
      titleEnd: "インシデント管理",
      subtitle:
        "インシデント対応の自動化、オンコールスケジュールの管理、非難のないポストモーテムの実施。NexaOpsは、信頼性の高いソフトウェアをより迅速に構築するのを支援します。",
      ctaPrimary: "無料でインシデント対応を開始",
      ctaSecondary: "デモを見る",
      trustedBy: "世界中のエンジニアリングチームから信頼されています",
    },
    features: {
      heroTitle: "機能",
      heroSubtitle: "インシデントをより迅速に解決するために必要なすべて。",
      openDashboard: "ダッシュボードを開く",
      login: "ログイン",
      badge: "インシデントチーム向け",
      tryDashboard: "ダッシュボードを試す",
      exploreResources: "リソースを探す",
      howTeamsUseTitle: "NexaOpsの活用方法",
      howTeamsUseSubtitle:
        "最初のページから事後分析まで、NexaOpsはインシデントライフサイクルを統合します。",
      deepDives: {
        incidentTimeline: {
          title: "インシデントタイムライン",
          points: [
            "チャット、アラート、ステータス更新からイベントを自動キャプチャ",
            "事後分析のためのワンクリックエクスポート",
            "ハンドオフのための検索可能なコンテキスト",
          ],
        },
        onCall: {
          title: "オンコール & ページング",
          points: [
            "フォロー・ザ・サンのカバレッジを持つローテーション",
            "フォールバックチャネル付きのエスカレーションポリシー",
            "特別なケースのための静かな時間とオーバーライド",
          ],
        },
        collaboration: {
          title: "コラボレーション",
          points: [
            "ステータスが同期されたSlackファーストのエクスペリエンス",
            "自動的に作成されるZoom/Meetブリッジ",
            "役員と顧客へのアナウンス",
          ],
        },
        guardrails: {
          title: "信頼性ガードレール",
          points: [
            "エラーバジェットアラート付きのSLO",
            "所有権を持つサービスカタログ",
            "アクティブなインシデントに対するリリースチェック",
          ],
        },
      },
      teams: {
        sre: {
          label: "SRE向け",
          title: "弾力性のあるSREチーム",
          desc: "オンコール、自動化、学習ループを組み合わせて、SREが顧客を満足させ、エンジニアのブロックを解除できるようにします。",
        },
        platform: {
          label: "プラットフォーム向け",
          title: "弾力性のあるプラットフォームチーム",
          desc: "オンコール、自動化、学習ループを組み合わせて、プラットフォームチームが顧客を満足させ、エンジニアのブロックを解除できるようにします。",
        },
        security: {
          label: "セキュリティ向け",
          title: "弾力性のあるセキュリティチーム",
          desc: "オンコール、自動化、学習ループを組み合わせて、セキュリティチームが顧客を満足させ、エンジニアのブロックを解除できるようにします。",
        },
      },
      seeItInAction: "動作を見る",
      highlights: {
        alerting: {
          title: "スマートアラート",
          copy: "サービスの所有権、深刻度、オンコールスケジュールに基づいてインシデントをルーティングします。",
        },
        runbooks: {
          title: "自動ランブック",
          copy: "ウォー・ルームを開き、Slackに投稿する繰り返し可能なワークフローをトリガーします。",
        },
        rbac: {
          title: "ロールベースの制御",
          copy: "管理者、対応者、閲覧者のための詳細な役割。",
        },
        insights: {
          title: "MTTRの洞察",
          copy: "MTTA、MTTR、およびインシデントバーンダウンのためのすぐに使えるダッシュボード。",
        },
      },
    },
    pricing: {
      heroTitle: "現在構築中 🛠️",
      heroSubtitle:
        "NexaOpsは開発中は無料で使用できます。すべての機能が誰でも利用可能です。",
      earlyAccess: "早期アクセス",
      perMonth: "/月",
      freeForever: "コミュニティおよび早期導入者向けに永久無料。",
      startFree: "無料で使い始める",
      supportTitle: "開発者を支援する",
      supportText:
        "私たちが作っているものが気に入って、インフラストラクチャのコストを支援したい、またはコーヒーを奢りたい場合は、以下から寄付できます。",
      getStarted: "始める",
      invoiceTitle: "請求書またはカスタム価格が必要ですか？",
      invoiceText:
        "エンタープライズの請求、調達、カスタム展開のサポートについては営業にご相談ください。",
      contactSales: "営業に問い合わせる",
      planFeatures: [
        "無制限のインシデント",
        "無制限のチームメンバー",
        "SlackとDiscordの統合",
        "ポストモーテムジェネレーター",
        "基本的なオンコールスケジューリング",
      ],
    },
    resources: {
      heroTitle: "NexaOps リソース",
      heroSubtitle:
        "信頼性の高いシステムと効果的なチームを構築するための洞察、ガイド、ベストプラクティス。",
      searchPlaceholder: "記事、ガイドなどを検索...",
      readMore: "続きを読む",
      goToDashboard: "ダッシュボードへ",
      items: {
        guideIncidentManagement: {
          type: "ガイド",
          title: "インシデント管理究極ガイド",
          desc: "インシデント対応プロセスをゼロから構築するために知っておくべきことすべて。",
        },
        webinarResilientSystems: {
          type: "ウェビナー",
          title: "大規模な回復力のあるシステムの構築",
          desc: "NetflixやGoogleのSREから、障害に備えた設計方法を学びます。",
        },
        articlePostMortem: {
          type: "記事",
          title: "ポストモーテムのベストプラクティス",
          desc: "システム改善につながる非難のないポストモーテムの実施方法。",
        },
        guideOnCallHealth: {
          type: "ガイド",
          title: "オンコールヘルスチェック",
          desc: "オンコールローテーションの健全性を評価し改善するためのフレームワーク。",
        },
        articleSLO: {
          type: "記事",
          title: "サービスレベル目標の定義",
          desc: "サービスに適したSLOを選択し測定するための実践ガイド。",
        },
        webinarAutomation: {
          type: "ウェビナー",
          title: "インシデント対応における自動化",
          desc: "ランブック自動化の謎を解き明かし、始める方法を解説します。",
        },
      },
    },
    incidentForm: {
      loading: "読み込み中...",
      accessDenied: "アクセス拒否",
      permissionDenied:
        "インシデントを作成する権限がありません。管理者に連絡してください。",
      createTitle: "新しいインシデントを作成",
      errorGeneric: "エラーが発生しました。もう一度お試しください。",
      title: "タイトル",
      titleRequired: "タイトルは必須です",
      description: "説明",
      severity: "重大度",
      cancel: "キャンセル",
      create: "インシデント作成",
      creating: "作成中...",
    },
    incidentDetail: {
      reportedBy: "報告者:",
      on: "日時:",
      timeline: "タイムラインとコメント",
      noActivity: "アクティビティはまだありません。",
      placeholder: "メモや更新を追加...",
      post: "コメントを投稿",
      posting: "投稿中...",
    },
    auth: {
      signInTitle: "アカウントにサインイン",
      signInSubtitle: "または",
      createAccount: "新しい会社アカウントを作成",
      emailLabel: "メールアドレス",
      passwordLabel: "パスワード",
      signInButton: "サインイン",
      createAccountTitle: "アカウントを作成",
      companyNameLabel: "会社名",
      fullNameLabel: "氏名",
      signInLink: "既存のアカウントにサインイン",
      createAccountButton: "アカウント作成",
      creatingAccount: "作成中...",
      errorInvalid: "メールアドレスまたはパスワードが無効です",
      errorGeneric: "登録に失敗しました",
      forgotPasswordLink: "パスワードをお忘れですか？",
      forgotTitle: "パスワードをリセット",
      forgotSubtitle:
        "メールアドレスを入力すると、リセットリンクをお送りします。",
      sendResetLink: "リセットリンクを送信",
      sending: "送信中...",
      forgotSuccess:
        "そのメールアドレスが登録されている場合、リセットリンクを送信しました。受信トレイをご確認ください。",
      resetTitle: "新しいパスワードを設定",
      newPasswordLabel: "新しいパスワード",
      confirmPasswordLabel: "パスワードの確認",
      resetButton: "パスワードをリセット",
      resetting: "リセット中...",
      resetSuccess: "パスワードが更新されました！サインインできます。",
      resetInvalid: "このリセットリンクは無効か期限切れです。",
      passwordMismatch: "パスワードが一致しません",
      backToLogin: "サインインに戻る",
    },
    team: {
      title: "チーム",
      members: "メンバー",
      invitations: "保留中の招待",
      inviteMember: "メンバーを招待",
      sendInvite: "招待を送信",
      sending: "送信中...",
      inviteSent: "招待を送信しました！",
      member: "メンバー",
      role: "役割",
      joined: "参加日",
      actions: "操作",
      you: "あなた",
      remove: "削除",
      confirmRemove: "このメンバーをチームから削除しますか？",
      noInvitations: "保留中の招待はありません。",
      expires: "有効期限",
      revoke: "取り消す",
      errorGeneric: "エラーが発生しました。もう一度お試しください。",
      roles: {
        OWNER: "オーナー",
        ADMIN: "管理者",
        RESPONDER: "対応者",
        OBSERVER: "オブザーバー",
        VIEWER: "閲覧者",
      },
      invitedToJoin: "次のチームに招待されています：",
      asRole: "役割：",
      joinTeam: "チームに参加",
      joining: "参加中...",
      inviteInvalid: "この招待は無効か期限切れです。",
      acceptTitle: "招待を承認",
    },
    settings: {
      title: "設定",
      profile: "プロフィール",
      accountReference: "アカウント参照",
      preferences: "設定",
      theme: "テーマ",
      language: "言語",
      role: "役割",
      tenantId: "テナントID",
      email: "メールアドレス",
      fullName: "氏名",
      tenantName: "テナント名",
    },
    contact: {
      heroTitle: "チームにお問い合わせ",
      heroSubtitle:
        "ご質問がありますか？私たちがサポートします。24時間365日対応のフレンドリーなチームにチャットして、2時間以内に解決しましょう。",
      form: {
        nameLabel: "名前",
        emailLabel: "職場メールアドレス",
        companyLabel: "会社ウェブサイト",
        messageLabel: "メッセージ",
        submitButton: "送信する",
        submitting: "送信中...",
        successMessage: "送信されました！まもなくご連絡いたします。",
      },
      sales: {
        title: "営業へのお問い合わせ",
        description:
          "エンタープライズプランにご興味がありますか？チームをどのように支援できるかお話ししましょう。",
        email: "sales@nexaops.com",
      },
      support: {
        title: "ヘルプとサポート",
        description:
          "すでに顧客ですか？アカウントや技術的な質問についてサポートを受けましょう。",
        email: "support@nexaops.com",
      },
    },
  },
  hi: {
    brandName: "नेक्साऑप्स",
    dashboard: {
      overview: "अवलोकन",
      incidents: "घटनाओं",
      settings: "सेटिंग्स",
      tenant: "टेनेंट",
      createIncident: "घटना बनाएँ",
      totalIncidents: "कुल घटनाएं",
      activeNow: "अभी सक्रिय",
      critical: "महत्वपूर्ण",
      high: "उच्च",
      noIncidents: "कोई घटना नहीं मिली।",
      statusLabel: "स्थिति:",
      createdBy: "द्वारा निर्मित",
      unknown: "अज्ञात",
      assignedTo: "को सौंपा गया:",
      unassigned: "असाइन नहीं किया गया",
      filterAll: "सभी",
      filterMine: "मुझे सौंपे गए",
      searchPlaceholder: "घटनाएं खोजें...",
      allStatuses: "सभी स्थितियाँ",
      allSeverities: "सभी गंभीरताएँ",
      severity: {
        CRITICAL: "महत्वपूर्ण",
        HIGH: "उच्च",
        MEDIUM: "मध्यम",
        LOW: "कम",
      },
      status: {
        OPEN: "खुला",
        ACKNOWLEDGED: "स्वीकृत",
        IN_PROGRESS: "प्रगति में",
        RESOLVED: "सुलझा हुआ",
        CLOSED: "बंद",
      },
    },
    nav: {
      features: "विशेषताएँ",
      resources: "संसाधन",
      pricing: "मूल्य निर्धारण",
      docs: "दस्तावेज़",
      signIn: "साइन इन",
      dashboard: "डैशबोर्ड पर जाएं",
      getStarted: "शुरू करें",
      signOut: "साइन आउट",
      contact: "संपर्क",
      signedIn: "साइन इन किया हुआ",
    },
    featureBadge: {
      live: "उपलब्ध",
      comingSoon: "जल्द आ रहा है",
    },
    landing: {
      poweringReliability: "इनकी विश्वसनीयता को शक्ति प्रदान कर रहा है",
      whyTitle: "नेक्साऑप्स क्यों?",
      whySubtitle:
        "घटनाओं को तेज़ी से हल करने और उनसे प्रभावी ढंग से सीखने के लिए आपको जो कुछ भी चाहिए।",
      cards: {
        incidentManagement: {
          title: "घटना प्रबंधन",
          desc: "गंभीरता स्तर, स्थिति अपडेट और लाइव टाइमलाइन के साथ घटनाएं बनाएं, ट्रैक करें और हल करें।",
        },
        timeline: {
          title: "टाइमलाइन और टिप्पणियाँ",
          desc: "रीयल-टाइम अपडेट के साथ खोजने योग्य टाइमलाइन में स्थिति परिवर्तन और टीम टिप्पणियाँ दर्ज करें।",
        },
        rbac: {
          title: "भूमिका-आधारित पहुंच",
          desc: "OWNER, ADMIN, RESPONDER और VIEWER भूमिकाओं के साथ मल्टी-टेनेंट अलगाव जो नियंत्रित करता है कि कौन घटनाओं पर कार्य कर सकता है।",
        },
        onCall: {
          title: "ऑन-कॉल शेड्यूलिंग",
          desc: "निष्पक्ष और लचीले ऑन-कॉल रोटेशन जो बर्नआउट को रोकते हैं और कवरेज सुनिश्चित करते हैं।",
        },
        integrations: {
          title: "यूनिवर्सल इंटीग्रेशन",
          desc: "Slack, Jira, Zoom, PagerDuty और 100+ ऑब्ज़र्वेबिलिटी टूल्स से जुड़ें।",
        },
        runbooks: {
          title: "रनबुक्स और पोस्टमार्टम",
          desc: "घटनाओं को सीख में बदलने के लिए इंटरैक्टिव रनबुक्स और दोषरहित पोस्टमार्टम टेम्पलेट।",
        },
      },
      resourcesTitle: "संसाधन",
      resourcesSubtitle: "उद्योग विशेषज्ञों से सर्वोत्तम अभ्यास सीखें।",
      viewAllResources: "सभी संसाधन देखें",
      readMore: "और पढ़ें",
      resourceCards: {
        guide: {
          category: "गाइड",
          title: "घटना प्रबंधन की व्यापक गाइड",
          desc: "SEV1 से पोस्टमार्टम तक, गंभीर घटनाओं को संभालना सीखें।",
        },
        webinar: {
          category: "वेबिनार",
          title: "विश्वसनीयता की संस्कृति बनाना",
          desc: "शीर्ष टेक कंपनियों के SRE लीडर्स के साथ हमारी पैनल चर्चा देखें।",
        },
        caseStudy: {
          category: "केस स्टडी",
          title: "TechFlow ने MTTR को 60% कैसे कम किया",
          desc: "देखें कि TechFlow ने अपनी प्रतिक्रिया को सुव्यवस्थित करने के लिए नेक्साऑप्स का उपयोग कैसे किया।",
        },
      },
      ctaTitle: "अपनी विश्वसनीयता सुधारने के लिए तैयार हैं?",
      ctaSubtitle:
        "हजारों डेवलपर्स से जुड़ें जो अपनी गंभीर घटनाओं के प्रबंधन के लिए नेक्साऑप्स पर भरोसा करते हैं।",
      ctaPrimary: "मुफ़्त में शुरू करें",
      ctaSecondary: "बिक्री से संपर्क करें",
    },
    footer: {
      product: "उत्पाद",
      company: "कंपनी",
      resources: "संसाधन",
      legal: "कानूनी",
      incidents: "घटनाएं",
      onCall: "ऑन-कॉल",
      postMortems: "पोस्टमार्टम",
      statusPages: "स्टेटस पेज",
      aboutUs: "हमारे बारे में",
      careers: "करियर",
      customers: "ग्राहक",
      contact: "संपर्क",
      blog: "ब्लॉग",
      documentation: "दस्तावेज़ीकरण",
      community: "समुदाय",
      partners: "पार्टनर्स",
      privacy: "गोपनीयता नीति",
      terms: "सेवा की शर्तें",
      security: "सुरक्षा",
      rights: "सर्वाधिकार सुरक्षित।",
    },
    chat: {
      title: "नेक्साऑप्स सहायता",
      greeting: "नमस्ते! आज मैं नेक्साऑप्स के बारे में आपकी कैसे मदद कर सकता हूं?",
      fallback:
        "संपर्क करने के लिए धन्यवाद! हमारी टीम जल्द ही आपसे संपर्क करेगी।",
      pricingReply:
        "नेक्साऑप्स सक्रिय विकास के दौरान वर्तमान में मुफ़्त है। विवरण के लिए हमारा मूल्य निर्धारण अनुभाग देखें।",
      featuresReply:
        "नेक्साऑप्स घटना प्रबंधन, ऑन-कॉल शेड्यूलिंग और स्वचालित पोस्टमार्टम प्रदान करता है।",
      placeholder: "संदेश लिखें...",
    },
    hero: {
      badge: "नई: नेक्साऑप्स एआई सहायक",
      titleStart: "आधुनिक इंजीनियरिंग टीमों के लिए",
      titleEnd: "घटना प्रबंधन",
      subtitle:
        "घटना प्रतिक्रिया को स्वचालित करें, ऑन-कॉल शेड्यूल प्रबंधित करें, और दोषरहित पोस्टमार्टम आयोजित करें। नेक्साऑप्स आपको अधिक विश्वसनीय सॉफ़्टवेयर तेजी से बनाने में मदद करता है।",
      ctaPrimary: "निःशुल्क घटनाएं संभालना शुरू करें",
      ctaSecondary: "डेमो देखें",
      trustedBy: "हर जगह इंजीनियरिंग टीमों द्वारा विश्वसनीय",
    },
    features: {
      heroTitle: "विशेषताएँ",
      heroSubtitle: "घटनाओं को तेज़ी से हल करने के लिए आपको जो कुछ भी चाहिए।",
      openDashboard: "डैशबोर्ड खोलें",
      login: "लॉगिन",
      badge: "घटना टीमों के लिए निर्मित",
      tryDashboard: "डैशबोर्ड आज़माएं",
      exploreResources: "संसाधन खोजें",
      howTeamsUseTitle: "टीमें NexaOps का उपयोग कैसे करती हैं",
      howTeamsUseSubtitle:
        "पहले पेज से लेकर पोस्टमार्टम तक, NexaOps आपके इंसिडेंट लाइफसाइकिल को एक साथ जोड़ता है।",
      deepDives: {
        incidentTimeline: {
          title: "घटना समयरेखा",
          points: [
            "चैट, अलर्ट और स्थिति अपडेट से ईवेंट ऑटो-कैप्चर करें",
            "पोस्टमार्टम के लिए एक-क्लिक निर्यात",
            "हैंडऑफ़ के लिए खोजने योग्य संदर्भ",
          ],
        },
        onCall: {
          title: "ऑन-कॉल और पेजिंग",
          points: [
            "फ़ॉलो-द-सन कवरेज के साथ रोटेशन",
            "फ़ॉलबैक चैनलों के साथ एस्केलेशन नीतियां",
            "विशेष मामलों के लिए शांत घंटे और ओवरराइड",
          ],
        },
        collaboration: {
          title: "सहयोग",
          points: [
            "सिंक की गई स्थिति के साथ स्लैक-फर्स्ट अनुभव",
            "स्वचालित रूप से बनाए गए ज़ूम/मीट ब्रिज",
            "अधिकारियों और ग्राहकों के लिए घोषणाएं",
          ],
        },
        guardrails: {
          title: "विश्वसनीयता रेलिंग",
          points: [
            "त्रुटि बजट अलर्ट के साथ SLO",
            "स्वामित्व के साथ सेवा सूची",
            "सक्रिय घटनाओं के खिलाफ रिलीज़ जांच",
          ],
        },
      },
      teams: {
        sre: {
          label: "SREs के लिए निर्मित",
          title: "लचीली SRE टीमें",
          desc: "ऑन-कॉल, ऑटोमेशन और लर्निंग लूप को पेयर करें ताकि SRE ग्राहकों को खुश रख सकें।",
        },
        platform: {
          label: "प्लेटफ़ॉर्म के लिए निर्मित",
          title: "लचीली प्लेटफ़ॉर्म टीमें",
          desc: "ऑन-कॉल, ऑटोमेशन और लर्निंग लूप को पेयर करें ताकि प्लेटफ़ॉर्म टीमें ग्राहकों को खुश रख सकें।",
        },
        security: {
          label: "सुरक्षा के लिए निर्मित",
          title: "लचीली सुरक्षा टीमें",
          desc: "ऑन-कॉल, ऑटोमेशन और लर्निंग लूप को पेयर करें ताकि सुरक्षा टीमें ग्राहकों को खुश रख सकें।",
        },
      },
      seeItInAction: "इसे काम करते हुए देखें",
      highlights: {
        alerting: {
          title: "स्मार्ट अलर्टिंग",
          copy: "सेवा स्वामित्व, गंभीरता और ऑन-कॉल शेड्यूल के आधार पर घटनाओं को रूट करें।",
        },
        runbooks: {
          title: "स्वचालित रनबुक्स",
          copy: "दोहराए जाने वाले वर्कफ़्लो को ट्रिगर करें जो वॉर रूम खोलते हैं और स्लैक पर पोस्ट करते हैं।",
        },
        rbac: {
          title: "भूमिका-आधारित नियंत्रण",
          copy: "प्रशासकों, उत्तरदाताओं और दर्शकों के लिए विस्तृत भूमिकाएँ।",
        },
        insights: {
          title: "MTTR अंतर्दृष्टि",
          copy: "MTTA, MTTR और घटना बर्नडाउन के लिए आउट-ऑफ़-द-बॉक्स डैशबोर्ड।",
        },
      },
    },
    pricing: {
      heroTitle: "वर्तमान में निर्माणधीन 🛠️",
      heroSubtitle:
        "NexaOps सक्रिय विकास के दौरान उपयोग करने के लिए स्वतंत्र है। सभी सुविधाएं सभी के लिए उपलब्ध हैं।",
      earlyAccess: "प्रारंभिक प्रवेश",
      perMonth: "/माह",
      freeForever: "समुदाय और शुरुआती अपनाने वालों के लिए हमेशा के लिए मुफ़्त।",
      startFree: "मुफ़्त में उपयोग करना शुरू करें",
      supportTitle: "डेवलपर का समर्थन करें",
      supportText:
        "यदि आप जो हम बना रहे हैं उसे पसंद करते हैं और बुनियादी ढांचे की लागत का समर्थन करना चाहते हैं या मुझे कॉफी खरीदना चाहते हैं, तो आप नीचे दान कर सकते हैं।",
      getStarted: "शुरू करें",
      invoiceTitle: "चालान या कस्टम मूल्य निर्धारण चाहिए?",
      invoiceText:
        "एंटरप्राइज़ बिलिंग, खरीद और कस्टम रोलआउट समर्थन के लिए बिक्री से बात करें।",
      contactSales: "बिक्री से संपर्क करें",
      planFeatures: [
        "असीमित घटनाएं",
        "असीमित टीम सदस्य",
        "Slack और Discord इंटीग्रेशन",
        "पोस्टमार्टम जेनरेटर",
        "बुनियादी ऑन-कॉल शेड्यूलिंग",
      ],
    },
    resources: {
      heroTitle: "नेक्साऑप्स संसाधन",
      heroSubtitle:
        "विश्वसनीय सिस्टम और प्रभावी टीमों को बनाने में आपकी मदद करने के लिए अंतर्दृष्टि, मार्गदर्शिकाएँ और सर्वोत्तम अभ्यास।",
      searchPlaceholder: "लेख, मार्गदर्शिकाएँ और अधिक खोजें...",
      readMore: "और पढ़ें",
      goToDashboard: "डैशबोर्ड पर जाएं",
      items: {
        guideIncidentManagement: {
          type: "गाइड",
          title: "घटना प्रबंधन के लिए अंतिम गाइड",
          desc: "आपको शून्य से एक घटना प्रतिक्रिया प्रक्रिया स्थापित करने के बारे में सब कुछ जानने की आवश्यकता है।",
        },
        webinarResilientSystems: {
          type: "वेबिनार",
          title: "स्केल पर लचीला सिस्टम बनाना",
          desc: "नेटफ्लिक्स और गूगल के SREs से जानें कि वे विफलता के लिए कैसे डिजाइन करते हैं।",
        },
        articlePostMortem: {
          type: "लेख",
          title: "पोस्टमार्टम सर्वोत्तम अभ्यास",
          desc: "दोषरहित पोस्टमार्टम कैसे आयोजित करें जो वास्तव में सिस्टम सुधार की ओर ले जाएं।",
        },
        guideOnCallHealth: {
          type: "गाइड",
          title: "ऑन-कॉल स्वास्थ्य जांच",
          desc: "आपके ऑन-कॉल रोटेशन के स्वास्थ्य का आकलन और सुधार करने के लिए एक ढांचा।",
        },
        articleSLO: {
          type: "लेख",
          title: "सेवा स्तर के उद्देश्यों को परिभाषित करना",
          desc: "आपकी सेवा के लिए सही SLOs चुनने और मापने के लिए एक व्यावहारिक गाइड।",
        },
        webinarAutomation: {
          type: "वेबिनार",
          title: "घटना प्रतिक्रिया में स्वचालन",
          desc: "रनबुक स्वचालन को समझना और कैसे शुरू करें।",
        },
      },
    },
    incidentForm: {
      loading: "लोड हो रहा है...",
      accessDenied: "प्रवेश अस्वीकृत",
      permissionDenied:
        "आपके पास घटनाएँ बनाने की अनुमति नहीं है। कृपया अपने व्यवस्थापक से संपर्क करें।",
      createTitle: "नई घटना बनाएँ",
      errorGeneric: "कुछ गलत हो गया। कृपया पुन: प्रयास करें।",
      title: "शीर्षक",
      titleRequired: "शीर्षक आवश्यक है",
      description: "विवरण",
      severity: "गंभीरता",
      cancel: "रद्द करें",
      create: "घटना बनाएँ",
      creating: "बना रहा है...",
    },
    incidentDetail: {
      reportedBy: "रिपोर्टकर्ता:",
      on: "दिनांक:",
      timeline: "समयरेखा और टिप्पणियाँ",
      noActivity: "अभी तक कोई गतिविधि नहीं।",
      placeholder: "नोट या अपडेट जोड़ें...",
      post: "टिप्पणी पोस्ट करें",
      posting: "पोस्ट किया जा रहा है...",
    },
    auth: {
      signInTitle: "अपने खाते में साइन इन करें",
      signInSubtitle: "या",
      createAccount: "एक नया कंपनी खाता बनाएँ",
      emailLabel: "ईमेल पता",
      passwordLabel: "पासवर्ड",
      signInButton: "साइन इन करें",
      createAccountTitle: "अपना खाता बनाएँ",
      companyNameLabel: "कंपनी का नाम",
      fullNameLabel: "पूरा नाम",
      signInLink: "मौजूदा खाते में साइन इन करें",
      createAccountButton: "खाता बनाएँ",
      creatingAccount: "बना रहा है...",
      errorInvalid: "अमान्य ईमेल या पासवर्ड",
      errorGeneric: "पंजीकरण विफल रहा",
      forgotPasswordLink: "पासवर्ड भूल गए?",
      forgotTitle: "अपना पासवर्ड रीसेट करें",
      forgotSubtitle:
        "अपना ईमेल पता दर्ज करें और हम आपको एक रीसेट लिंक भेजेंगे।",
      sendResetLink: "रीसेट लिंक भेजें",
      sending: "भेज रहा है...",
      forgotSuccess:
        "यदि वह ईमेल पंजीकृत है, तो एक रीसेट लिंक भेज दिया गया है। अपना इनबॉक्स देखें।",
      resetTitle: "नया पासवर्ड चुनें",
      newPasswordLabel: "नया पासवर्ड",
      confirmPasswordLabel: "पासवर्ड की पुष्टि करें",
      resetButton: "पासवर्ड रीसेट करें",
      resetting: "रीसेट हो रहा है...",
      resetSuccess: "पासवर्ड अपडेट हो गया! अब आप साइन इन कर सकते हैं।",
      resetInvalid: "यह रीसेट लिंक अमान्य है या समाप्त हो गया है।",
      passwordMismatch: "पासवर्ड मेल नहीं खाते",
      backToLogin: "साइन इन पर वापस जाएं",
    },
    team: {
      title: "टीम",
      members: "सदस्य",
      invitations: "लंबित निमंत्रण",
      inviteMember: "सदस्य आमंत्रित करें",
      sendInvite: "निमंत्रण भेजें",
      sending: "भेज रहा है...",
      inviteSent: "निमंत्रण भेजा गया!",
      member: "सदस्य",
      role: "भूमिका",
      joined: "शामिल हुए",
      actions: "क्रियाएँ",
      you: "आप",
      remove: "हटाएं",
      confirmRemove: "इस सदस्य को टीम से हटाएं?",
      noInvitations: "कोई लंबित निमंत्रण नहीं।",
      expires: "समाप्ति",
      revoke: "रद्द करें",
      errorGeneric: "कुछ गलत हो गया। कृपया पुन: प्रयास करें।",
      roles: {
        OWNER: "स्वामी",
        ADMIN: "व्यवस्थापक",
        RESPONDER: "उत्तरदाता",
        OBSERVER: "पर्यवेक्षक",
        VIEWER: "दर्शक",
      },
      invitedToJoin: "आपको शामिल होने के लिए आमंत्रित किया गया है:",
      asRole: "भूमिका:",
      joinTeam: "टीम में शामिल हों",
      joining: "शामिल हो रहे हैं...",
      inviteInvalid: "यह निमंत्रण अमान्य है या समाप्त हो गया है।",
      acceptTitle: "निमंत्रण स्वीकार करें",
    },
    settings: {
      title: "सेटिंग्स",
      profile: "प्रोफ़ाइल",
      accountReference: "खाता संदर्भ",
      preferences: "पसंद",
      theme: "थीम",
      language: "भाषा",
      role: "भूमिका",
      tenantId: "टेनेंट आईडी",
      email: "ईमेल",
      fullName: "पूरा नाम",
      tenantName: "टेनेंट नाम",
    },
    contact: {
      heroTitle: "हमारी टीम से संपर्क करें",
      heroSubtitle:
        "कोई सवाल है? हम मदद करने के लिए यहाँ हैं। हमारी टीम से 24/7 चैट करें और 2 घंटे के भीतर समाधान पाएं।",
      form: {
        nameLabel: "नाम",
        emailLabel: "कार्य ईमेल",
        companyLabel: "कंपनी वेबसाइट",
        messageLabel: "संदेश",
        submitButton: "संदेश भेजें",
        submitting: "भेज रहा है...",
        successMessage: "संदेश भेजा गया! हम जल्द ही संपर्क करेंगे।",
      },
      sales: {
        title: "बिक्री से बात करें",
        description:
          "हमारे एंटरप्राइज़ प्लान में रुचि है? आइए बात करें कि हम आपकी टीम की मदद कैसे कर सकते हैं।",
        email: "sales@nexaops.com",
      },
      support: {
        title: "मदद और सहायता",
        description:
          "पहले से ही ग्राहक हैं? अपने खाते या तकनीकी प्रश्नों के साथ सहायता प्राप्त करें।",
        email: "support@nexaops.com",
      },
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  locale: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "ja" || value === "hi";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Restore the saved choice after hydration (server always renders "en",
  // so reading localStorage in the initializer would cause a hydration
  // mismatch).
  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(saved)) {
      // One-time post-hydration restore; reading localStorage in the
      // initializer would desync server and client HTML.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        locale: locales[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

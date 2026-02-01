"use client";

import { createContext, ReactNode, useContext, useState } from "react";

type Language = "en" | "ja" | "hi";

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
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: translations[language] }}
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

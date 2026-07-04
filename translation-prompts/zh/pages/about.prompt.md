Target language: Chinese (中文)
Target locale: zh-CN
Text direction: ltr
Expected destination path: src/content/pages/about/index.zh.md

Translate the source file below from English into the target language.
Return only the translated file content. Do not wrap the whole answer in Markdown fences. Do not add explanations.

Rules:
- Translate human-readable prose only.
- Preserve every frontmatter key and data type.
- Preserve Markdown and MDX syntax.
- Preserve code fences, inline code, raw HTML tags, directives, image URLs, local file paths, external URLs, and technical identifiers.
- Preserve the slug and do not rename files.
- Preserve image paths exactly, including relative paths such as ./cover.jpg.
- Keep dates, booleans, arrays, and nested frontmatter objects valid.

Source file:
```markdown
---
layout: '~/layouts/MarkdownLayout.astro'
title: About Me
---

I am a Software Engineer with experience in full-stack development and cloud technologies. I have worked at notable companies including Amazon and Generali Insurance, where I developed scalable solutions and improved existing systems.

Currently, I am the CTO and Co-Founder of [Bluvo](https://bluvo.co), building one API to move crypto across all exchanges.

## Startup Experience

<div style="display: flex; align-items: center; margin-bottom: 2rem;">
  <img src="/images/bluvo.png" alt="Bluvo" style="width: 80px; height: 80px; margin-right: 1rem; object-fit: contain;">
  <div>
    <h3 style="margin: 0;">CTO | Co-Founder at Bluvo</h3>
    <p style="margin: 0;">Hybrid | Feb 2025 - Present</p>
  </div>
</div>

- built an API that moves $60M crypto onchain and offchain
- initiated over 100k transactions & stored over 30,000 wallet sessions
- maintained over 270 third-party CEX APIs and aggregated into 1 flow
- implemented CI/CD pipelines and geo-optimized infra for prod reliability
- local-first dev via vitest & miniflare, emulating cloud resources locally & mocking third-party HTTP servers
- TDD & pre-commit hook test coverages
- B2B tenant-per-customer-db via in memory DB, persisting in SQLite
- auto-generated openapi spec -> SDK (rust, go, ts, c#)

---

<div style="display: flex; align-items: center; margin-bottom: 2rem;">
  <img src="/images/alliance-logo.png" alt="Alliance" style="width: 80px; height: 80px; margin-right: 1rem; object-fit: contain;">
  <div>
    <h3 style="margin: 0;">Demoday - Alliance</h3>
    <p style="margin: 0;">New York City | Apr 2026 - May 2026</p>
  </div>
</div>

- gave my co-founder a back rub before he had to give his pitch
- hopped in 237 VC meetings to explain the same tech over and over again

---

<div style="display: flex; align-items: center; margin-bottom: 2rem;">
  <img src="/images/alliance-logo.png" alt="Alliance" style="width: 80px; height: 80px; margin-right: 1rem; object-fit: contain;">
  <div>
    <h3 style="margin: 0;">Pre-Seed Cohort - Alliance</h3>
    <p style="margin: 0;">New York City | Aug 2025 - Nov 2025</p>
  </div>
</div>

- raised $450k pre-seed round
- completed 2-week in-person orientation in NYC
- selected among the top <0.5% of startups

---

<div style="display: flex; align-items: center; margin-bottom: 2rem;">
  <img src="/images/thirdweblogo.png" alt="thirdweb" style="width: 80px; height: 80px; margin-right: 1rem; object-fit: contain;">
  <div>
    <h3 style="margin: 0;">Startup Program - thirdweb</h3>
    <p style="margin: 0;">San Francisco | Apr 2025 - May 2025</p>
  </div>
</div>

- participated in thirdweb C5 program with 30 selected web3 startups
- presented Bluvo at the Demo Day

---

<div style="display: flex; align-items: center; margin-bottom: 2rem;">
  <img src="/images/finclogo.png" alt="Founders Inc" style="width: 80px; height: 80px; margin-right: 1rem; object-fit: contain;">
  <div>
    <h3 style="margin: 0;">Accelerator Program - Founders, Inc.</h3>
    <p style="margin: 0;">San Francisco | Feb 2025 - Apr 2025</p>
  </div>
</div>

- accepted into Ship[it] accelerator
- shipped Bluvo - one unified API for all crypto exchanges
- pitched in front of a LOT of people

---

<div style="display: flex; align-items: center; margin-bottom: 2rem;">
  <img src="/images/groq-logo.png" alt="Groq" style="width: 80px; height: 80px; margin-right: 1rem; object-fit: contain;">
  <div>
    <h3 style="margin: 0;">Hackathon - Groq</h3>
    <p style="margin: 0;">San Francisco | Jan 2025</p>
  </div>
</div>

- had fun at a hackathon in SF

---

<div style="display: flex; align-items: center; margin-bottom: 2rem;">
  <img src="/images/yc-logo.png" alt="Y Combinator" style="width: 80px; height: 80px; margin-right: 1rem; object-fit: contain;">
  <div>
    <h3 style="margin: 0;">Startup School - Y Combinator</h3>
    <p style="margin: 0;">London | Nov 2024</p>
  </div>
</div>

- got accepted into the first YC startup school event in London

---

<div style="display: flex; align-items: center; margin-bottom: 2rem;">
  <img src="/images/dipsway-logo.png" alt="DipSway" style="width: 80px; height: 80px; margin-right: 1rem; object-fit: contain;">
  <div>
    <h3 style="margin: 0;">Co-Founder | CEO at DipSway</h3>
    <p style="margin: 0;">Tallinn, Estonia | Oct 2022 - Jan 2026</p>
  </div>
</div>

- built a blackbox SaaS that connects to Coinbase and makes money by auto-trading
- scaled to 1,000+ active crypto trading bots with 99% uptime and $20-50M total trading volume
- supported major 11 CEXs (Binance, Coinbase, Kraken, KuCoin, ByBit, Gateio, Bitget, Bitmart, OKX, Cryptocom...)
- built a vector-db with all the trading data of our users to predict next coin pump

---

<div style="display: flex; align-items: center; margin-bottom: 2rem;">
  <img src="/images/blogfast-logo.png" alt="BlogFAST" style="width: 80px; height: 80px; margin-right: 1rem; object-fit: contain;">
  <div>
    <h3 style="margin: 0;">Co-Founder | CEO at BlogFAST</h3>
    <p style="margin: 0;">Tallinn, Estonia | May 2024 - Aug 2024</p>
  </div>
</div>

- built a GPT-powered tool that generates SEO-optimized blog posts to drive qualified traffic and leads
- exited (asset-acquisition) for 5 digits

## Professional Experience

<div style="display: flex; align-items: center; margin-bottom: 2rem;">
  <img src="/images/amazon-logo.png" alt="Amazon" style="width: 80px; height: 80px; margin-right: 1rem; object-fit: contain;">
  <div>
    <h3 style="margin: 0;">Software Engineer Intern - Amazon</h3>
    <p style="margin: 0;">Luxembourg | Feb 2022 - Sep 2022</p>
  </div>
</div>

- helped folks at Amazon predict, simulate & optimize product deliveries
- reduced CPU usage of a stochastic warehouse-network simulation by 10x using memoization caching
- refactored 5+ Python codebases with OOP patterns, cutting code size by ~3x (measured by Git diff)
- designed and deployed full-stack IaC solution with AWS CDK + a self-service Angular tool for stakeholders to run custom jobs
- cut heavy-task execution costs by 180% by switching to Fargate + EFS

---

<div style="display: flex; align-items: center; margin-bottom: 2rem;">
  <img src="/images/generali-logo.png" alt="Generali Insurance" style="width: 80px; height: 80px; margin-right: 1rem; object-fit: contain;">
  <div>
    <h3 style="margin: 0;">Java Developer & DevOps - Generali</h3>
    <p style="margin: 0;">Mogliano, Italy | Jun 2021 - Feb 2022</p>
  </div>
</div>

- built vehicle insurance backend used by 2+ insurance aggregation websites
- followed strict Test-Driven Development (JUnit) across all new features
- created custom Jenkins step that automatically generates and publishes project documentation
- monitored and managed Kubernetes clusters with K9s; infrastructure defined in Terraform

---

<div style="display: flex; align-items: center; margin-bottom: 2rem;">
  <img src="/images/venis-logo.jpg" alt="Venis SPA" style="width: 80px; height: 80px; margin-right: 1rem; object-fit: contain;">
  <div>
    <h3 style="margin: 0;">Full Stack Engineer - Venis SpA</h3>
    <p style="margin: 0;">Venice | Sep 2019 - Jun 2021</p>
  </div>
</div>

- built a ML algorithm able to predict high tides in Venice using proximity sensor data across the canals
- developed and maintained whistleblowing platform sold to 11+ companies
- reduced Angular page load time by 19x by adding lazy loading
- introduced ActiveMQ messaging queue to decouple and reliably handle email delivery

---

<div style="display: flex; align-items: center; margin-bottom: 2rem;">
  <img src="/images/wowsolution-logo.png" alt="Wow Solution" style="width: 80px; height: 80px; margin-right: 1rem; object-fit: contain;">
  <div>
    <h3 style="margin: 0;">Back End Developer - Wow Solution S.r.l.</h3>
    <p style="margin: 0;">Treviso | Jun 2019 - Jul 2019</p>
  </div>
</div>

- skipped highschool to ship software
- built Node.js REST API for uploading/downloading museum object photos (multipart files)
- designed MongoDB schema and loaded 40,000+ museum records
- created custom barcode-scanning service in Vue.js for on-site sticker recognition

## Competitive Programming

<div style="display: flex; align-items: center; margin-bottom: 2rem;">
  <img src="/images/oii-logo.svg" alt="Italian Olympiads" style="width: 80px; height: 80px; margin-right: 1rem; object-fit: contain;">
  <div>
    <h3 style="margin: 0;">Practitioner & Unofficial Teacher</h3>
    <p style="margin: 0;">Remote | Apr 2017 - Present</p>
  </div>
</div>

- Solved [310+ competitive programming problems](https://training.olinfo.it/user/fl0rian) over 7 years of timespan
- Mentored 50+ students willing to participate in the Italian Olympiads of Informatics resulting in bronze and gold medals
- Developed educational content for dynamic programming and graph algorithms

## Technical Skills

**Programming Languages:** Java, C/C++, JavaScript, TypeScript, Dart, Python, Go, Ruby, Rust, Swift, PHP, Elixir

**Web Technologies:** HTML/CSS, Angular, Astro, Next.js, Nuxt, Vue.js, React, Django, Flask, Rails, Sinatra, Svelte, Tailwind CSS

**Cloud & DevOps:** AWS (EC2, Lambda, S3, CloudFormation, RDS, Route 53, EKS), Terraform, AWS CDK, Docker, Kubernetes, Jenkins, CircleCI, GitLab CI

**Databases:** PostgreSQL, SQLite, MongoDB, DynamoDB, Redshift, MySQL, Aurora, Firebase, Redis, ElasticSearch, Cassandra

**Mobile Development:** Flutter, Android, iOS (Swift/Objective-C), React Native, Kotlin, Xamarin

## Contact

Feel free to reach out regarding opportunities or collaborations.
Email: **sabaniforian@gmail.com**

```

---
layout: page
title: About
subtitle: Who is Florian Sabani?
permalink: /about/
---

{% assign dateStart = "2000-09-20" | date: '%s' %}
{% assign nowTimestamp = 'now' | date: '%s' %}
{% assign diffSeconds = nowTimestamp | minus: dateStart %}
{% assign diffDays = diffSeconds | divided_by: 3600 | divided_by: 24 | divided_by: 365 %}

Hey there, I'm a {{ diffDays | round: 0 }}-year-old guy who's passionate about coding and hacking. I started working as a software developer when I was just 15 years old, and I've been hooked ever since.

I've always been fascinated by technology and the endless possibilities it provides. That's why I decided to pursue a career in software development, and I haven't looked back since.

Over the years, I've honed my skills as a developer and hacker, and I've worked on a variety of projects. I'm always looking for new challenges and opportunities to learn and grow.

Currently, I'm a successful startup co-founder, working on a range of exciting projects. I'm constantly pushing the boundaries of what's possible, and I'm always striving to make a positive impact on the world through my work.

If you're interested in learning more about what I do or want to collaborate on a project, don't hesitate to [send me an email](mailto: sabaniflorian@gmail.com). 

I'm always looking for like-minded individuals to work with and learn from.
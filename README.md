## Project overview

This repository contains a **training project** as part of an internal learning exercise.

The objective is to design and implement a small web application that meets the following requirements:

- Web application supporting CRUD operations  
- Persistent data storage  
- User authentication restricting access to a selected group of users  
- RESTful API for all CRUD operations  
- All components hosted in AWS  
- Use Infrastructure as Code with AWS CDK to define and deploy cloud resources 
- No use of Amplify or AppSync  

Based on these requirements, the project models a **Scenarios** service.

## What the Scenarios service does

The Scenarios service is a small internal tool for storing and managing **scenarios that describe business behaviour, edge cases, and testing flows**.

Each scenario captures a clear sequence of steps showing how functionality behaves and how it should be tested across services.

Scenarios are used by:
- developers, to understand system behaviour and business logic  
- QA engineers, to follow consistent steps when testing features and edge cases  


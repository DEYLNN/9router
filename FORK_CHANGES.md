# Fork Changes

This document tracks the notable changes made in this fork compared with the upstream 9Router project.

## Quota Dashboard

- Added a provider/category filter to the Provider Limits view so quota cards can be narrowed to a single provider such as Kiro, Codex, or GitHub.
- Added a `Trial ending first` toggle for Kiro accounts. When enabled, Kiro cards are sorted by the earliest `credit_freetrial` expiry, making accounts with expiring bonus/free trial credits appear first.
- Kept the original quota row colors and dot/status icons unchanged after adding the Kiro sorting controls.
- Fixed Kiro quota expiry parsing for Unix timestamps returned as seconds or numeric strings, preventing trial/bonus credit expiry from displaying as an incorrect January/1970-style date.

## Provider And Dashboard Customization

- Added provider assets for Azure and Blackbox in the fork.
- Updated dashboard provider, combo, usage, sidebar, header, and shared usage components for the fork-specific dashboard experience.
- Added auth-files dashboard/API work for managing imported auth files and refreshing Codex credentials.

## Notes

- The Kiro credit data still comes from the Kiro/AWS `GetUsageLimits` response. If Kiro Dev shows additional encrypted-only bonus credit metadata, this fork can only display it when an equivalent plain field is available from the quota API.
- Keep this file updated when adding fork-only features so future rebases and upstream comparisons are easier.

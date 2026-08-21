# 🚨 CRITICAL FIXES NEEDED FOR STIW TRACKER

## Issues Identified from User Feedback:

### 1. **Tab Order Wrong** ❌
- Current: Calculator tab is first, Submit Request is second
- **Required:** Submit Request tab should be FIRST

### 2. **Tabs Not Working** ❌
- User reports "none of the other tabs work"
- Tab switching functionality is broken

### 3. **Missing Policy Links** ❌
- Submit Request tab missing policy acknowledgment checkbox
- Missing links to policy guidelines
- Missing go/compass links

### 4. **Duplicate Purpose Labels** ❌
- Empty Purpose label divs at lines 522, 529, 781, 788
- Causing visual duplication in forms

### 5. **Missing Core Functionality** ❌
- Submit Request form incomplete
- Policy acknowledgment missing
- Links not appearing properly

## IMMEDIATE ACTION REQUIRED:

1. **Fix Tab Order:**
   - Move Submit Request tab to first position
   - Ensure "active" class is on Submit Request tab

2. **Fix Tab Functionality:**
   - Verify JavaScript tab switching works
   - Test all four tabs (Submit, Calculator, Tracking, Employee Management)

3. **Restore Policy Elements:**
   - Add policy acknowledgment checkbox to Submit Request form
   - Add policy guidelines link
   - Add go/compass links

4. **Remove Duplicate Purpose Labels:**
   - Remove empty Purpose divs at specified lines
   - Keep only functional Purpose fields with textareas

5. **Test Complete Functionality:**
   - All tabs working
   - All forms functional
   - All links working
   - Policy acknowledgment working

## CURRENT STATUS: 🔴 BROKEN
The deployed version is missing critical functionality and has broken tab navigation.

## TARGET: ✅ FULLY FUNCTIONAL
All tabs working, proper form structure, complete policy integration, no duplicate labels.

---
**Priority:** CRITICAL - Fix immediately before any other changes**
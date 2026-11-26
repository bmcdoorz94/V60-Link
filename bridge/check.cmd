@echo off
title Claude live check
cd /d "%~dp0"
node check.js --html %*

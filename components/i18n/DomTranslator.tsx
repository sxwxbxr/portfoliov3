"use client"

import { useCallback, useEffect, useRef } from "react"
import { useI18nContext } from "./I18nProvider"
import { translateFromDictionary } from "@/lib/i18n/dictionary"
import type { SupportedLanguage } from "@/lib/i18n/dictionary"
import { requestTranslations } from "@/lib/i18n/client"

const IGNORED_PARENT_SELECTOR = "[data-no-translate]"

const hasAlphabeticalCharacter = (value: string) => /[a-z]/i.test(value)

const restoreSpacing = (original: string, translated: string) => {
  const leadingWhitespace = original.match(/^\s*/)?.[0] ?? ""
  const trailingWhitespace = original.match(/\s*$/)?.[0] ?? ""
  return `${leadingWhitespace}${translated}${trailingWhitespace}`
}

const collectTextNodes = (root: HTMLElement): Text[] => {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.parentElement) return NodeFilter.FILTER_REJECT
      if (node.parentElement.closest(IGNORED_PARENT_SELECTOR)) return NodeFilter.FILTER_REJECT
      const content = node.textContent ?? ""
      if (!content.trim()) return NodeFilter.FILTER_REJECT
      if (!hasAlphabeticalCharacter(content)) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })

  let current: Node | null = walker.nextNode()
  while (current) {
    nodes.push(current as Text)
    current = walker.nextNode()
  }

  return nodes
}

const getDictionaryTranslation = (language: SupportedLanguage, text: string) => {
  if (!text.trim()) return text
  if (language === "en") return text
  const dictionaryMatch = translateFromDictionary(language, text)
  return dictionaryMatch ?? text
}

export const DomTranslator = () => {
  const { language, translateInstant, cacheTranslation, getCachedTranslation } = useI18nContext()
  const originalsRef = useRef(new WeakMap<Text, string>())
  const observerRef = useRef<MutationObserver | null>(null)
  const pendingRef = useRef<Map<string, Set<Text>>>(new Map())
  const fetchingRef = useRef(false)

  const flushPendingTranslations = useCallback(async () => {
    if (fetchingRef.current) return

    const pendingEntries = Array.from(pendingRef.current.entries())
    if (!pendingEntries.length) return

    fetchingRef.current = true
    pendingRef.current.clear()

    try {
      const texts = pendingEntries.map(([text]) => text)
      const translations = await requestTranslations(texts, language)

      pendingEntries.forEach(([original, nodes]) => {
        const translated = translations[original]
        if (!translated) return
        nodes.forEach((node) => {
          const baseValue = originalsRef.current.get(node) ?? original
          cacheTranslation(baseValue, translated, language)
          node.textContent = restoreSpacing(baseValue, translated)
        })
      })
    } finally {
      fetchingRef.current = false
    }
  }, [language, cacheTranslation])

  useEffect(() => {
    if (typeof window === "undefined") return
    const root = document.body
    if (!root) return

    const originals = originalsRef.current

    const updateNode = (node: Text) => {
      const currentValue = node.textContent ?? ""
      if (!currentValue.trim()) return
      if (!hasAlphabeticalCharacter(currentValue)) return

      const baseValue = originals.get(node) ?? currentValue
      originals.set(node, baseValue)

      if (language === "en") {
        node.textContent = baseValue
        return
      }

      const cachedTranslation = getCachedTranslation(baseValue, language)
      if (cachedTranslation) {
        node.textContent = restoreSpacing(baseValue, cachedTranslation)
        return
      }

      const instantTranslation = translateInstant(baseValue)
      if (instantTranslation !== baseValue) {
        cacheTranslation(baseValue, instantTranslation, language)
        node.textContent = restoreSpacing(baseValue, instantTranslation)
        return
      }

      const dictionaryTranslation = getDictionaryTranslation(language, baseValue)
      if (dictionaryTranslation !== baseValue) {
        cacheTranslation(baseValue, dictionaryTranslation, language)
        node.textContent = restoreSpacing(baseValue, dictionaryTranslation)
        return
      }

      const existing = pendingRef.current.get(baseValue) ?? new Set<Text>()
      existing.add(node)
      pendingRef.current.set(baseValue, existing)
    }

    const processNodes = (nodes: Text[]) => {
      nodes.forEach(updateNode)
      flushPendingTranslations()
    }

    const initialNodes = collectTextNodes(root)
    processNodes(initialNodes)

    observerRef.current?.disconnect()
    observerRef.current = new MutationObserver((mutations) => {
      const nodesToTranslate: Text[] = []

      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") {
          const target = mutation.target as Text
          nodesToTranslate.push(target)
          return
        }

        mutation.addedNodes.forEach((added) => {
          if (added.nodeType === Node.TEXT_NODE) {
            nodesToTranslate.push(added as Text)
            return
          }

          if (added instanceof HTMLElement) {
            nodesToTranslate.push(...collectTextNodes(added))
          }
        })
      })

      if (nodesToTranslate.length) {
        processNodes(nodesToTranslate)
      }
    })

    observerRef.current.observe(root, {
      characterData: true,
      childList: true,
      subtree: true,
    })

    return () => observerRef.current?.disconnect()
  }, [language, translateInstant, flushPendingTranslations, cacheTranslation, getCachedTranslation])

  useEffect(() => {
    if (typeof window === "undefined") return
    const root = document.body
    if (!root) return
    pendingRef.current.clear()
    const nodes = collectTextNodes(root)
    nodes.forEach((node) => {
      const originals = originalsRef.current
      const baseValue = originals.get(node) ?? node.textContent ?? ""
      originals.set(node, baseValue)

      if (!baseValue.trim() || !hasAlphabeticalCharacter(baseValue)) {
        return
      }

      if (language === "en") {
        node.textContent = baseValue
        return
      }

      const cachedTranslation = getCachedTranslation(baseValue, language)
      if (cachedTranslation) {
        node.textContent = restoreSpacing(baseValue, cachedTranslation)
        return
      }

      const instantTranslation = translateInstant(baseValue)
      if (instantTranslation !== baseValue) {
        cacheTranslation(baseValue, instantTranslation, language)
        node.textContent = restoreSpacing(baseValue, instantTranslation)
        return
      }

      const dictionaryTranslation = getDictionaryTranslation(language, baseValue)
      if (dictionaryTranslation !== baseValue) {
        cacheTranslation(baseValue, dictionaryTranslation, language)
        node.textContent = restoreSpacing(baseValue, dictionaryTranslation)
        return
      }

      const existing = pendingRef.current.get(baseValue) ?? new Set<Text>()
      existing.add(node)
      pendingRef.current.set(baseValue, existing)
    })
    flushPendingTranslations()
  }, [language, translateInstant, cacheTranslation, getCachedTranslation, flushPendingTranslations])

  return null
}

export default DomTranslator

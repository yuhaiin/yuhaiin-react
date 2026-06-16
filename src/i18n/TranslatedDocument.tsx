import { useEffect } from 'react';
import { translateInterpolatedText } from './autoTranslate';
import { SupportedLanguage } from './languages';

const originalText = new WeakMap<Text, string>();
const renderedText = new WeakMap<Text, string>();
const translatedAttributes = ['placeholder', 'aria-label', 'title'] as const;

function normalizeText(value: string) {
    return value.replace(/\s+/g, ' ').trim();
}

function shouldSkipElement(element: Element | null) {
    if (!element) return true;
    if (element.closest('[data-i18n-skip], .notranslate, code, pre, script, style, textarea')) return true;
    return false;
}

function translateTextNode(node: Text, language: SupportedLanguage) {
    const element = node.parentElement;
    if (shouldSkipElement(element)) return;

    const current = node.nodeValue ?? '';
    const previousRendered = renderedText.get(node);
    let source = originalText.get(node);

    if (source === undefined || (previousRendered !== undefined && current !== previousRendered)) {
        source = current;
        originalText.set(node, source);
    }

    const trimmed = normalizeText(source);
    if (!trimmed) {
        renderedText.set(node, source);
        return;
    }

    const translated = translateInterpolatedText(trimmed, language);
    if (!translated) {
        renderedText.set(node, source);
        if (node.nodeValue !== source) node.nodeValue = source;
        return;
    }

    const leading = source.match(/^\s*/)?.[0] ?? '';
    const trailing = source.match(/\s*$/)?.[0] ?? '';
    const next = `${leading}${translated}${trailing}`;
    renderedText.set(node, next);
    if (node.nodeValue !== next) node.nodeValue = next;
}

function translateElementAttributes(element: Element, language: SupportedLanguage) {
    if (shouldSkipElement(element)) return;

    for (const attr of translatedAttributes) {
        const current = element.getAttribute(attr);
        if (!current) continue;

        const storageName = `data-i18n-original-${attr}`;
        const source = element.getAttribute(storageName) ?? current;
        if (!element.hasAttribute(storageName)) {
            element.setAttribute(storageName, source);
        }

        const translated = translateInterpolatedText(source, language);
        const next = translated ?? source;
        if (current !== next) element.setAttribute(attr, next);
    }
}

function walk(root: ParentNode, language: SupportedLanguage) {
    if (root instanceof Element) {
        translateElementAttributes(root, language);
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let node = walker.nextNode();
    while (node) {
        if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node as Text, language);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            translateElementAttributes(node as Element, language);
        }
        node = walker.nextNode();
    }
}

export function TranslatedDocument({ language }: { language: SupportedLanguage }) {
    useEffect(() => {
        const translate = () => walk(document.body, language);
        translate();

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            translateTextNode(node as Text, language);
                        } else if (node.nodeType === Node.ELEMENT_NODE) {
                            walk(node as Element, language);
                        }
                    });
                } else if (mutation.type === 'characterData') {
                    translateTextNode(mutation.target as Text, language);
                } else if (mutation.type === 'attributes') {
                    translateElementAttributes(mutation.target as Element, language);
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: [...translatedAttributes],
        });

        return () => observer.disconnect();
    }, [language]);

    return null;
}

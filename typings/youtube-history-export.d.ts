/// <reference path="globals/clyvari/index.d.ts" />

declare namespace clyvari
{
    namespace YoutubeHistoryExport
    {
        export type LinkFormatterCallback = ChainableFunction<Element>;
        export type HistoryEntry = {title: string, url: string, user: string};
    }
}

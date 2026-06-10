export function segmentsToPlain(segments) {
  return segments.map((s) => s.text).join('');
}

export function createInitialSegments(text, userId, name) {
  return [{ userId, name, text: text || '' }];
}

function sliceSegments(segments, start, end) {
  const result = [];
  let pos = 0;
  for (const seg of segments) {
    const segStart = pos;
    const segEnd = pos + seg.text.length;
    if (segEnd <= start || segStart >= end) {
      pos = segEnd;
      continue;
    }
    const sliceStart = Math.max(start, segStart) - segStart;
    const sliceEnd = Math.min(end, segEnd) - segStart;
    const slice = { ...seg, text: seg.text.slice(sliceStart, sliceEnd) };
    delete slice.modifiedBy;
    delete slice.modifiedByName;
    result.push(slice);
    pos = segEnd;
  }
  return result;
}

export function mergeAdjacentSameUser(segments) {
  const merged = [];
  for (const seg of segments) {
    if (!seg.text) continue;
    const last = merged[merged.length - 1];
    const sameAuthor = last
      && last.userId === seg.userId
      && last.modifiedBy === seg.modifiedBy
      && last.modifiedByName === seg.modifiedByName;
    if (sameAuthor) {
      last.text += seg.text;
    } else {
      merged.push({ ...seg });
    }
  }
  return merged;
}

function diffEdit(segments, newPlain, editorUserId, editorName) {
  const oldPlain = segmentsToPlain(segments);
  if (oldPlain === newPlain) return segments;

  let prefixLen = 0;
  while (
    prefixLen < oldPlain.length
    && prefixLen < newPlain.length
    && oldPlain[prefixLen] === newPlain[prefixLen]
  ) {
    prefixLen += 1;
  }

  let suffixLen = 0;
  while (
    suffixLen < oldPlain.length - prefixLen
    && suffixLen < newPlain.length - prefixLen
    && oldPlain[oldPlain.length - 1 - suffixLen] === newPlain[newPlain.length - 1 - suffixLen]
  ) {
    suffixLen += 1;
  }

  const middleNew = newPlain.slice(prefixLen, newPlain.length - suffixLen);
  const prefixSegs = sliceSegments(segments, 0, prefixLen);
  const suffixSegs = sliceSegments(segments, oldPlain.length - suffixLen, oldPlain.length);
  const editedOldSegs = sliceSegments(segments, prefixLen, oldPlain.length - suffixLen);

  if (!middleNew) {
    return mergeAdjacentSameUser([...prefixSegs, ...suffixSegs]);
  }

  if (editedOldSegs.length === 0) {
    return mergeAdjacentSameUser([
      ...prefixSegs,
      { userId: editorUserId, name: editorName, text: middleNew },
      ...suffixSegs,
    ]);
  }

  const primaryOwner = editedOldSegs[0].userId;
  const primaryName = editedOldSegs[0].name;

  if (primaryOwner === editorUserId) {
    return mergeAdjacentSameUser([
      ...prefixSegs,
      { userId: editorUserId, name: editorName, text: middleNew },
      ...suffixSegs,
    ]);
  }

  return mergeAdjacentSameUser([
    ...prefixSegs,
    {
      userId: primaryOwner,
      name: primaryName,
      text: middleNew,
      modifiedBy: editorUserId,
      modifiedByName: editorName,
    },
    ...suffixSegs,
  ]);
}

export function applyLocalEdit(segments, newPlain, userId, name) {
  return diffEdit(segments, newPlain, userId, name);
}

export function rebuildSegments(oldPlain, newPlain, oldSegments, authorUserId, authorName) {
  return diffEdit(oldSegments, newPlain, authorUserId, authorName);
}

export function segmentsMatchContent(segments, content) {
  return segmentsToPlain(segments) === content;
}

export function getSegmentAuthors(segments) {
  const authors = new Map();
  for (const seg of segments) {
    if (seg.text && seg.userId && seg.name && !authors.has(seg.userId)) {
      authors.set(seg.userId, seg.name);
    }
  }
  return [...authors.entries()].map(([id, name]) => ({ id, name }));
}

export function getSegmentModifiers(segments) {
  const modifiers = new Map();
  for (const seg of segments) {
    if (seg.modifiedBy && seg.modifiedByName && !modifiers.has(seg.modifiedBy)) {
      modifiers.set(seg.modifiedBy, seg.modifiedByName);
    }
  }
  return [...modifiers.entries()].map(([id, name]) => ({ id, name }));
}

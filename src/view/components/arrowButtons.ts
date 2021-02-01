interface SvgArrow {
  id: string;
  viewBox: string;
  g: {
    filter: string;
  };
  path: {
    d: string;
  };
  filter: {
    id: string;
    x: string;
    y: string;
    width: string;
    height: string;
  };
}

function createSVG(arrowType: SvgArrow): SVGElement {
  const xmlns = "http://www.w3.org/2000/svg";
  const svg: SVGElement = document.createElementNS(xmlns, "svg");
  svg.setAttributeNS(null, "width", "100%");
  svg.setAttributeNS(null, "height", "100%");
  svg.setAttributeNS(null, "viewBox", arrowType.viewBox);
  svg.setAttributeNS(null, "id", arrowType.id);

  const g: SVGGElement = document.createElementNS(xmlns, "g");
  svg.appendChild(g);
  g.setAttributeNS(null, "filter", `url(${arrowType.g.filter})`);

  const path: SVGPathElement = document.createElementNS(xmlns, "path");
  g.appendChild(path);
  path.setAttributeNS(null, "id", `${arrowType.id}_path`);
  path.setAttributeNS(null, "fill", "black");
  path.setAttributeNS(null, "d", `${arrowType.path.d}`);

  const defs: SVGDefsElement = document.createElementNS(xmlns, "defs");
  svg.appendChild(defs);

  const filter: SVGFilterElement = document.createElementNS(xmlns, "filter");
  defs.appendChild(filter);
  filter.setAttributeNS(null, "filterUnits", "userSpaceOnUse");
  filter.setAttributeNS(null, "color-interpolation-filters", "sRGB");
  filter.setAttributeNS(null, "id", `${arrowType.filter.id}`);
  filter.setAttributeNS(null, "x", `${arrowType.filter.x}`);
  filter.setAttributeNS(null, "y", `${arrowType.filter.y}`);
  filter.setAttributeNS(null, "width", `${arrowType.filter.width}`);
  filter.setAttributeNS(null, "height", `${arrowType.filter.height}`);

  const feFlood: SVGFEFloodElement = document.createElementNS(xmlns, "feFlood");
  filter.appendChild(feFlood);
  feFlood.setAttributeNS(null, "flood-opacity", "0");
  feFlood.setAttributeNS(null, "result", "BackgroundImageFix");

  const feColorMatrix: SVGFEColorMatrixElement = document.createElementNS(
    xmlns,
    "feColorMatrix"
  );
  filter.appendChild(feColorMatrix);
  feColorMatrix.setAttributeNS(null, "in", "SourceAlpha");
  feColorMatrix.setAttributeNS(null, "type", "matrix");
  feColorMatrix.setAttributeNS(
    null,
    "values",
    "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
  );

  const feOffset: SVGFEOffsetElement = document.createElementNS(
    xmlns,
    "feOffset"
  );
  filter.appendChild(feOffset);
  feOffset.setAttributeNS(null, "dy", "3");

  const feGaussianBlur: SVGFEGaussianBlurElement = document.createElementNS(
    xmlns,
    "feGaussianBlur"
  );
  filter.appendChild(feGaussianBlur);
  feGaussianBlur.setAttributeNS(null, "stdDeviation", "1");

  const feColorMatrix2: SVGFEColorMatrixElement = document.createElementNS(
    xmlns,
    "feColorMatrix"
  );
  filter.appendChild(feColorMatrix2);
  feColorMatrix2.setAttributeNS(null, "type", "matrix");
  feColorMatrix2.setAttributeNS(
    null,
    "values",
    "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.54 0"
  );

  const feBlend: SVGFEBlendElement = document.createElementNS(xmlns, "feBlend");
  filter.appendChild(feBlend);
  feBlend.setAttributeNS(null, "mode", "normal");
  feBlend.setAttributeNS(null, "in2", "BackgroundImageFix");
  feBlend.setAttributeNS(null, "result", "effect1_dropShadow");

  const feBlend2: SVGFEBlendElement = document.createElementNS(
    xmlns,
    "feBlend"
  );
  filter.appendChild(feBlend2);
  feBlend2.setAttributeNS(null, "mode", "normal");
  feBlend2.setAttributeNS(null, "in", "SourceGraphic");
  feBlend2.setAttributeNS(null, "in2", "effect1_dropShadow");
  feBlend2.setAttributeNS(null, "result", "shape");

  return svg;
}

const upArrowSpecs: SvgArrow = {
  id: "upArrow",
  viewBox: "2 0 8 9",
  g: {
    filter: "#filterUp",
  },
  path: {
    d:
      "M6.35355 0.646447C6.15829 0.451185 5.84171 0.451185 5.64645 0.646447L2.46447 3.82843C2.2692 4.02369 2.2692 4.34027 2.46447 4.53553C2.65973 4.7308 2.97631 4.7308 3.17157 4.53553L6 1.70711L8.82843 4.53553C9.02369 4.7308 9.34027 4.7308 9.53553 4.53553C9.7308 4.34027 9.7308 4.02369 9.53553 3.82843L6.35355 0.646447ZM6.5 2V1H5.5V2H6.5Z",
  },
  filter: {
    id: "filterUp",
    x: "0.318024",
    y: "0.5",
    width: "11.364",
    height: "9.18198",
  },
};

const downArrowSpecs: SvgArrow = {
  id: "downArrow",
  viewBox: "2 0 8 9",
  g: {
    filter: "#filterDown",
  },
  path: {
    d:
      "M5.64645 4.35355C5.84171 4.54882 6.15829 4.54882 6.35355 4.35355L9.53553 1.17157C9.7308 0.976311 9.7308 0.659728 9.53553 0.464466C9.34027 0.269204 9.02369 0.269204 8.82843 0.464466L6 3.29289L3.17157 0.464466C2.97631 0.269204 2.65973 0.269204 2.46447 0.464466C2.2692 0.659728 2.2692 0.976311 2.46447 1.17157L5.64645 4.35355ZM5.5 3V4H6.5V3H5.5Z",
  },
  filter: {
    id: "filterDown",
    x: "0.318024",
    y: "0.318024",
    width: "11.364",
    height: "9.18198",
  },
};

const leftArrowSpecs: SvgArrow = {
  id: "leftArrow",
  viewBox: "0 0 7 12.5",
  g: {
    filter: "#filterLeft",
  },
  path: {
    d:
      "M2.64645 3.64645C2.45118 3.84171 2.45118 4.15829 2.64645 4.35355L5.82843 7.53553C6.02369 7.7308 6.34027 7.7308 6.53553 7.53553C6.7308 7.34027 6.7308 7.02369 6.53553 6.82843L3.70711 4L6.53553 1.17157C6.7308 0.976311 6.7308 0.659728 6.53553 0.464466C6.34027 0.269204 6.02369 0.269204 5.82843 0.464466L2.64645 3.64645ZM4 3.5H3V4.5H4V3.5Z",
  },
  filter: {
    id: "filterLeft",
    x: "0.5",
    y: "0.318024",
    width: "8.18198",
    height: "12.364",
  },
};

const rightArrowSpecs: SvgArrow = {
  id: "rightArrow",
  viewBox: "0 0 7 12.5",
  g: {
    filter: "#filterRight",
  },
  path: {
    d:
      "M6.35355 4.35355C6.54882 4.15829 6.54882 3.84171 6.35355 3.64645L3.17157 0.464466C2.97631 0.269204 2.65973 0.269204 2.46447 0.464466C2.2692 0.659728 2.2692 0.976311 2.46447 1.17157L5.29289 4L2.46447 6.82843C2.2692 7.02369 2.2692 7.34027 2.46447 7.53553C2.65973 7.7308 2.97631 7.7308 3.17157 7.53553L6.35355 4.35355ZM5 4.5H6V3.5H5V4.5Z",
  },
  filter: {
    id: "filterRight",
    x: "0.318024",
    y: "0.318024",
    width: "8.18198",
    height: "12.364",
  },
};

export const upArrow: SVGElement = createSVG(upArrowSpecs);
export const downArrow: SVGElement = createSVG(downArrowSpecs);
export const leftArrow: SVGElement = createSVG(leftArrowSpecs);
export const rightArrow: SVGElement = createSVG(rightArrowSpecs);

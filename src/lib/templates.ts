import { DocumentTemplate, DocumentType, TemplateStructure } from './types'

const structures: Record<DocumentType, TemplateStructure> = {
  '通知': {
    titlePlaceholder: '关于XXX的通知',
    sendToPlaceholder: '各有关单位：',
    bodyPlaceholder: '　　为了……，根据……，现将有关事项通知如下：\n　　一、……\n　　二、……\n　　三、……',
    sections: [
      { name: '事由', placeholder: '简要说明通知的原因和目的', isRequired: true },
      { name: '事项', placeholder: '具体通知内容', isRequired: true },
      { name: '执行要求', placeholder: '落实要求和时限', isRequired: false },
    ],
  },
  '请示': {
    titlePlaceholder: '关于XXX的请示',
    sendToPlaceholder: 'XXX（上级机关）：',
    bodyPlaceholder: '　　根据……，我单位拟……。现将有关情况报告如下：\n　　一、基本情况\n　　……\n　　二、请示事项\n　　……\n　　妥否，请批示。',
    sections: [
      { name: '缘由', placeholder: '请示的原因和背景', isRequired: true },
      { name: '事项', placeholder: '请示的具体内容', isRequired: true },
      { name: '结语', placeholder: '请示结束语', isRequired: true },
    ],
  },
  '报告': {
    titlePlaceholder: '关于XXX的报告',
    sendToPlaceholder: 'XXX（上级机关）：',
    bodyPlaceholder: '　　根据……要求，现将……情况报告如下：\n　　一、基本情况\n　　……\n　　二、主要做法\n　　……\n　　三、存在问题\n　　……\n　　四、下一步计划\n　　……',
    sections: [
      { name: '基本情况', placeholder: '工作概况', isRequired: true },
      { name: '主要做法', placeholder: '具体措施和成效', isRequired: true },
      { name: '问题与建议', placeholder: '存在问题及改进建议', isRequired: false },
    ],
  },
  '函': {
    titlePlaceholder: '关于XXX的函',
    sendToPlaceholder: 'XXX（对方单位）：',
    bodyPlaceholder: '　　……（正文内容）。\n　　请予以协助为盼。',
    sections: [
      { name: '事由', placeholder: '去函的原因', isRequired: true },
      { name: '事项', placeholder: '商洽、询问或答复的具体内容', isRequired: true },
    ],
  },
  '批复': {
    titlePlaceholder: '关于XXX的批复',
    sendToPlaceholder: 'XXX（下级机关）：',
    bodyPlaceholder: '　　你单位《关于……的请示》（……号）收悉。经研究，现批复如下：\n　　一、……\n　　二、……',
    sections: [
      { name: '引述来文', placeholder: '引述请示文件', isRequired: true },
      { name: '批复意见', placeholder: '具体批复内容', isRequired: true },
    ],
  },
  '决定': {
    titlePlaceholder: '关于XXX的决定',
    sendToPlaceholder: '各有关单位：',
    bodyPlaceholder: '　　为了……，根据……，经研究决定：\n　　一、……\n　　二、……\n　　三、……',
    sections: [
      { name: '缘由', placeholder: '作出决定的原因和依据', isRequired: true },
      { name: '决定事项', placeholder: '具体决定内容', isRequired: true },
    ],
  },
  '意见': {
    titlePlaceholder: '关于XXX的意见',
    sendToPlaceholder: '各有关单位：',
    bodyPlaceholder: '　　为了……，根据……，现提出以下意见：\n　　一、总体要求\n　　……\n　　二、主要任务\n　　……\n　　三、保障措施\n　　……',
    sections: [
      { name: '总体要求', placeholder: '指导思想和基本原则', isRequired: true },
      { name: '主要任务', placeholder: '具体工作任务', isRequired: true },
      { name: '保障措施', placeholder: '组织保障和实施要求', isRequired: false },
    ],
  },
  '纪要': {
    titlePlaceholder: 'XXX会议纪要',
    sendToPlaceholder: '',
    bodyPlaceholder: '　　X月X日，XXX召开……会议。会议……，现纪要如下：\n　　一、……\n　　二、……\n　　三、……',
    sections: [
      { name: '会议概况', placeholder: '时间、地点、参会人员', isRequired: true },
      { name: '议定事项', placeholder: '会议决定的具体事项', isRequired: true },
    ],
  },
}

export function getPresetTemplates(): DocumentTemplate[] {
  return (Object.keys(structures) as DocumentType[]).map((type) => ({
    id: `preset-${type}`,
    name: `${type}模板`,
    type,
    isPreset: true,
    structure: structures[type],
  }))
}

export function getTemplateStructure(type: DocumentType): TemplateStructure {
  return structures[type]
}

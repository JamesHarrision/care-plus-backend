export const swaggerSchemas = {
  ErrorResponse: {
    type: 'object',
    required: ['status', 'message'],
    properties: {
      status: {
        type: 'string',
        example: 'error',
      },
      message: {
        type: 'string',
      },
    },
  },
  MessageResponse: {
    type: 'object',
    required: ['status', 'data'],
    properties: {
      status: {
        type: 'string',
        example: 'success',
      },
      data: {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string',
          },
        },
      },
    },
  },
  TokenPair: {
    type: 'object',
    required: ['accessToken', 'refreshToken'],
    properties: {
      accessToken: {
        type: 'string',
      },
      refreshToken: {
        type: 'string',
      },
    },
  },
  AuthUserSummary: {
    type: 'object',
    required: ['id', 'full_name', 'system_role'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      full_name: {
        type: 'string',
      },
      system_role: {
        type: 'string',
        enum: ['ADMIN', 'USER'],
      },
    },
  },
  AuthenticatedUserProfile: {
    type: 'object',
    required: ['id', 'role', 'full_name', 'system_role', 'is_active', 'created_at', 'updated_at'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      role: {
        type: 'string',
        enum: ['ADMIN', 'USER'],
      },
      full_name: {
        type: 'string',
      },
      phone: {
        type: 'string',
      },
      email: {
        type: 'string',
        format: 'email',
        nullable: true,
      },
      system_role: {
        type: 'string',
        enum: ['ADMIN', 'USER'],
      },
      is_active: {
        type: 'boolean',
      },
      created_at: {
        type: 'string',
        format: 'date-time',
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
      },
    },
  },
  Family: {
    type: 'object',
    required: ['id', 'name', 'created_at', 'updated_at'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      name: {
        type: 'string',
      },
      address: {
        type: 'string',
        nullable: true,
      },
      invite_code: {
        type: 'string',
        nullable: true,
        maxLength: 6,
      },
      invite_code_exp: {
        type: 'string',
        format: 'date-time',
        nullable: true,
      },
      created_at: {
        type: 'string',
        format: 'date-time',
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
      },
    },
  },
  PendingFamilyMember: {
    type: 'object',
    required: ['id', 'join_status'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      user_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
      },
      full_name: {
        type: 'string',
        nullable: true,
      },
      email: {
        type: 'string',
        format: 'email',
        nullable: true,
      },
      phone: {
        type: 'string',
        nullable: true,
      },
      join_status: {
        type: 'string',
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
      },
    },
  },
  InviteCodeResponse: {
    type: 'object',
    required: ['inviteCode', 'expiresIn'],
    properties: {
      inviteCode: {
        type: 'string',
      },
      expiresIn: {
        type: 'integer',
        format: 'int32',
      },
    },
  },
  ResetPasswordResponse: {
    type: 'object',
    required: ['message'],
    properties: {
      message: {
        type: 'string',
      },
    },
  },
  FamilyMembership: {
    type: 'object',
    required: ['family_id', 'family_role', 'joined_at'],
    properties: {
      family_id: {
        type: 'string',
        format: 'uuid',
      },
      family_name: {
        type: 'string',
      },
      family_address: {
        type: 'string',
        nullable: true,
      },
      family_role: {
        type: 'string',
        enum: ['OWNER', 'MEMBER'],
      },
      family_relation: {
        type: 'string',
        nullable: true,
      },
      joined_at: {
        type: 'string',
        format: 'date-time',
      },
    },
  },
  FamilyMemberSummary: {
    type: 'object',
    required: ['member_id', 'family_role', 'joined_at'],
    properties: {
      member_id: {
        type: 'string',
        format: 'uuid',
      },
      user_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
      },
      full_name: {
        type: 'string',
        nullable: true,
      },
      email: {
        type: 'string',
        format: 'email',
        nullable: true,
      },
      phone: {
        type: 'string',
        nullable: true,
      },
      family_role: {
        type: 'string',
        enum: ['OWNER', 'MEMBER'],
      },
      date_of_birth: {
        type: 'string',
        format: 'date',
        nullable: true,
      },
      avatar_url: {
        type: 'string',
        format: 'uri',
        nullable: true,
      },
      joined_at: {
        type: 'string',
        format: 'date-time',
      },
    },
  },
  FamilyMemberProfile: {
    type: 'object',
    required: ['family_id', 'family_role', 'family'],
    properties: {
      family_id: {
        type: 'string',
        format: 'uuid',
      },
      family_role: {
        type: 'string',
        enum: ['OWNER', 'MEMBER'],
      },
      family_relation: {
        type: 'string',
        nullable: true,
      },
      family: {
        $ref: '#/components/schemas/Family',
      },
    },
  },
  FamilyMemberSummaryList: {
    type: 'object',
    required: ['members'],
    properties: {
      members: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/FamilyMemberSummary',
        },
      },
    },
  },
  FamilyListItem: {
    type: 'object',
    required: ['family_id', 'family_name', 'family_role', 'joined_at'],
    properties: {
      family_id: {
        type: 'string',
        format: 'uuid',
      },
      family_name: {
        type: 'string',
      },
      family_address: {
        type: 'string',
        nullable: true,
      },
      family_role: {
        type: 'string',
        enum: ['OWNER', 'MEMBER'],
      },
      joined_at: {
        type: 'string',
        format: 'date-time',
      },
    },
  },
  FamilyListResponse: {
    type: 'object',
    required: ['families'],
    properties: {
      families: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/FamilyListItem',
        },
      },
    },
  },
  PendingFamilyMemberList: {
    type: 'object',
    required: ['members'],
    properties: {
      members: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/PendingFamilyMember',
        },
      },
    },
  },
  AuthTokens: {
    type: 'object',
    required: ['accessToken', 'refreshToken'],
    properties: {
      accessToken: {
        type: 'string',
      },
      refreshToken: {
        type: 'string',
      },
    },
  },
  AuthLoginUser: {
    type: 'object',
    required: ['id', 'full_name', 'system_role'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      full_name: {
        type: 'string',
      },
      system_role: {
        type: 'string',
        enum: ['ADMIN', 'USER'],
      },
    },
  },
  AuthVerificationUser: {
    type: 'object',
    required: ['id', 'system_role', 'full_name'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      system_role: {
        type: 'string',
        enum: ['ADMIN', 'USER'],
      },
      full_name: {
        type: 'string',
      },
    },
  },
  UserMeFamily: {
    type: 'object',
    required: ['family_id', 'family_role', 'family'],
    properties: {
      family_id: {
        type: 'string',
        format: 'uuid',
      },
      family_role: {
        type: 'string',
        enum: ['OWNER', 'MEMBER'],
      },
      family_relation: {
        type: 'string',
        nullable: true,
      },
      family: {
        $ref: '#/components/schemas/Family',
      },
    },
  },
  EmergencyInfoUpsertInput: {
    type: 'object',
    properties: {
      blood_type: {
        type: 'string',
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        nullable: true,
      },
      allergies: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      chronic_diseases: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      emergency_contacts: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/EmergencyContact',
        },
      },
      current_medications: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      notes: {
        type: 'string',
        nullable: true,
      },
    },
  },
  UserMeProfile: {
    type: 'object',
    required: ['id', 'role', 'full_name', 'system_role', 'is_active', 'created_at', 'updated_at'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      role: {
        type: 'string',
        enum: ['ADMIN', 'USER'],
      },
      full_name: {
        type: 'string',
      },
      phone: {
        type: 'string',
        nullable: true,
      },
      email: {
        type: 'string',
        format: 'email',
        nullable: true,
      },
      system_role: {
        type: 'string',
        enum: ['ADMIN', 'USER'],
      },
      is_active: {
        type: 'boolean',
      },
      created_at: {
        type: 'string',
        format: 'date-time',
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
      },
      family: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/UserMeFamily',
        },
      },
    },
  },
  DeviceTokenResponse: {
    type: 'object',
    required: ['message'],
    properties: {
      message: {
        type: 'string',
      },
    },
  },
  EmergencyContact: {
    type: 'object',
    required: ['name', 'phone', 'relationship'],
    properties: {
      name: {
        type: 'string',
      },
      phone: {
        type: 'string',
      },
      relationship: {
        type: 'string',
      },
    },
  },
  EmergencyInfo: {
    type: 'object',
    required: ['user_id', 'allergies', 'chronic_diseases', 'emergency_contacts', 'current_medications', 'updated_at'],
    properties: {
      user_id: {
        type: 'string',
        format: 'uuid',
      },
      blood_type: {
        type: 'string',
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        nullable: true,
      },
      allergies: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      chronic_diseases: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      emergency_contacts: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/EmergencyContact',
        },
      },
      current_medications: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      notes: {
        type: 'string',
        nullable: true,
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
      },
    },
  },
  PublicEmergencyInfo: {
    type: 'object',
    required: ['full_name', 'allergies', 'chronic_diseases', 'emergency_contacts', 'current_medications'],
    properties: {
      full_name: {
        type: 'string',
      },
      blood_type: {
        type: 'string',
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        nullable: true,
      },
      allergies: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      chronic_diseases: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      emergency_contacts: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/EmergencyContact',
        },
      },
      current_medications: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  },
  QrCodeResponse: {
    type: 'object',
    required: ['qrCodeUrl', 'quickAccessUrl'],
    properties: {
      qrCodeUrl: {
        type: 'string',
      },
      quickAccessUrl: {
        type: 'string',
        format: 'uri',
      },
    },
  },
  HealthRecord: {
    type: 'object',
    required: ['family_member_id', 'updated_by_user_id', 'type', 'value', 'unit', 'recorded_at', 'created_at'],
    properties: {
      _id: {
        type: 'string',
      },
      family_member_id: {
        type: 'string',
        format: 'uuid',
      },
      updated_by_user_id: {
        type: 'string',
        format: 'uuid',
      },
      type: {
        type: 'string',
      },
      value: {
        type: 'object',
        additionalProperties: true,
      },
      unit: {
        type: 'string',
      },
      note: {
        type: 'string',
        nullable: true,
      },
      recorded_at: {
        type: 'string',
        format: 'date-time',
      },
      created_at: {
        type: 'string',
        format: 'date-time',
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
      },
    },
  },
  MedicationItem: {
    type: 'object',
    required: ['name', 'dosage', 'frequency'],
    properties: {
      name: {
        type: 'string',
      },
      dosage: {
        type: 'string',
      },
      frequency: {
        type: 'string',
      },
      bin: {
        type: 'string',
        nullable: true,
        description: 'Binary schedule hint for morning, noon, afternoon, evening.',
      },
      times: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      days: {
        type: 'number',
        nullable: true,
      },
    },
  },
  MedicationSchedule: {
    type: 'object',
    required: [
      'family_id',
      'family_member_id',
      'medications',
      'start_date',
      'reminder_message',
      'is_active',
      'created_at',
    ],
    properties: {
      _id: {
        type: 'string',
      },
      family_id: {
        type: 'string',
        format: 'uuid',
      },
      family_member_id: {
        type: 'string',
        format: 'uuid',
      },
      medications: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/MedicationItem',
        },
      },
      start_date: {
        type: 'string',
        format: 'date-time',
      },
      end_date: {
        type: 'string',
        format: 'date-time',
        nullable: true,
      },
      reminder_message: {
        type: 'string',
      },
      is_active: {
        type: 'boolean',
      },
      session_times: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      confirmed_by: {
        type: 'string',
        nullable: true,
      },
      created_at: {
        type: 'string',
        format: 'date-time',
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
      },
    },
  },
  PrescriptionScanItem: {
    type: 'object',
    required: ['name', 'dosage', 'frequency'],
    properties: {
      name: {
        type: 'string',
      },
      dosage: {
        type: 'string',
      },
      frequency: {
        type: 'string',
      },
      bin: {
        type: 'string',
        nullable: true,
      },
      days: {
        type: 'number',
        nullable: true,
      },
    },
  },
  PrescriptionScanResponse: {
    type: 'object',
    required: ['extracted', 'confidence'],
    properties: {
      extracted: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/PrescriptionScanItem',
        },
      },
      confidence: {
        type: 'number',
        minimum: 0,
        maximum: 1,
      },
    },
  },
};

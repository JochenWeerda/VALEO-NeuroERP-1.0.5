package v1

import (
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// ValeoAppSpec defines the desired state of ValeoApp
type ValeoAppSpec struct {
	// Size is the size of the ValeoApp deployment
	Size int32 `json:"size"`

	// Image is the image of the ValeoApp
	Image string `json:"image"`

	// Version is the version of the ValeoApp
	Version string `json:"version"`

	// Resources is the resource requirements for the ValeoApp
	// +optional
	Resources *corev1.ResourceRequirements `json:"resources,omitempty"`

	// Modules is a list of modules to enable in the ValeoApp
	// +optional
	Modules []string `json:"modules,omitempty"`

	// Database configuration for the ValeoApp
	// +optional
	Database *DatabaseConfig `json:"database,omitempty"`
}

// DatabaseConfig defines the database configuration for ValeoApp
type DatabaseConfig struct {
	// Type is the type of database to use
	Type string `json:"type"`

	// Version is the version of the database
	Version string `json:"version"`

	// Size is the size of the database storage
	Size string `json:"size"`
}

// ValeoAppStatus defines the observed state of ValeoApp
type ValeoAppStatus struct {
	// Phase is the current phase of the ValeoApp
	// +optional
	Phase string `json:"phase,omitempty"`

	// Message provides more information about the current phase
	// +optional
	Message string `json:"message,omitempty"`

	// ReadyReplicas is the number of ready replicas
	// +optional
	ReadyReplicas int32 `json:"readyReplicas"`
}

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// ValeoApp is the Schema for the valeoapps API
// +kubebuilder:subresource:status
// +kubebuilder:resource:path=valeoapps,scope=Namespaced,shortName=vapp
// +kubebuilder:printcolumn:name="Status",type="string",JSONPath=".status.phase"
// +kubebuilder:printcolumn:name="Version",type="string",JSONPath=".spec.version"
// +kubebuilder:printcolumn:name="Replicas",type="integer",JSONPath=".spec.size"
// +kubebuilder:printcolumn:name="Ready",type="integer",JSONPath=".status.readyReplicas"
// +kubebuilder:printcolumn:name="Age",type="date",JSONPath=".metadata.creationTimestamp"
type ValeoApp struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   ValeoAppSpec   `json:"spec,omitempty"`
	Status ValeoAppStatus `json:"status,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// ValeoAppList contains a list of ValeoApp
type ValeoAppList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []ValeoApp `json:"items"`
}

func init() {
	SchemeBuilder.Register(&ValeoApp{}, &ValeoAppList{})
} 